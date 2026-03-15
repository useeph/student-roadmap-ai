import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateRoadmapWithOpenAI } from "@/lib/ai/openai-client";
import { runAdmissionsStrategyOptimizer } from "@/lib/optimizer";
import type { StudentProfileInput } from "@/types";

function profileFromStudent(student: {
  name: string;
  age: number | null;
  gradeLevel: string | null;
  graduationYear: number | null;
  gpa: number | null;
  currentClasses: string[];
  intendedMajors: string[];
  intendedIndustry: string | null;
  targetColleges: string[];
  interests: string[];
  extracurriculars: string[];
  awards: string[];
  leadershipExp: string[];
  githubUrl: string | null;
  portfolioUrl: string | null;
  hoursPerWeek: number | null;
  constraints: string | null;
  goals: string | null;
  testScores: unknown;
}): StudentProfileInput {
  return {
    name: student.name,
    age: student.age ?? undefined,
    gradeLevel: student.gradeLevel ?? undefined,
    graduationYear: student.graduationYear ?? undefined,
    gpa: student.gpa ?? undefined,
    currentClasses: student.currentClasses,
    intendedMajors: student.intendedMajors,
    intendedIndustry: student.intendedIndustry ?? undefined,
    targetColleges: student.targetColleges,
    interests: student.interests,
    extracurriculars: student.extracurriculars,
    awards: student.awards,
    leadershipExp: student.leadershipExp,
    githubUrl: student.githubUrl ?? undefined,
    portfolioUrl: student.portfolioUrl ?? undefined,
    hoursPerWeek: student.hoursPerWeek ?? undefined,
    constraints: student.constraints ?? undefined,
    goals: student.goals ?? undefined,
    testScores: student.testScores as { sat?: number; act?: number; apScores?: number[] } | undefined,
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const studentId = typeof body?.studentId === "string" ? body.studentId : null;

    if (!studentId) {
      return NextResponse.json(
        { error: "studentId is required" },
        { status: 400 }
      );
    }

    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      include: { roadmap: true },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student profile not found" },
        { status: 404 }
      );
    }

    const profile = profileFromStudent(student);

    const { roadmap: openaiRoadmap, source, demoMode } = await generateRoadmapWithOpenAI(profile);
    const admissionsStrategyOptimizer = runAdmissionsStrategyOptimizer(profile);

    const strengths = Array.isArray(openaiRoadmap.strengths) ? openaiRoadmap.strengths : [];
    const gaps = Array.isArray(openaiRoadmap.gaps) ? openaiRoadmap.gaps : [];
    const roadmapData = {
      studentSummary: openaiRoadmap.studentSummary ?? "",
      strengthsAnalysis: strengths.join(" "),
      gapsAnalysis: gaps.join(" "),
      recommendedExtracurriculars: openaiRoadmap.extracurricularRecommendations.map((r) => ({
        name: r.title,
        reason: r.reason,
        priority: r.priority.toLowerCase() as "high" | "medium" | "low",
      })) as object,
      recommendedProjects: openaiRoadmap.projectIdeas.map((p) => ({
        name: p.title,
        reason: p.description,
        priority: "high" as const,
      })) as object,
      courseworkSuggestions: openaiRoadmap.courseworkSuggestions.map((c) => ({
        name: c,
        reason: "Strengthens academic profile.",
        priority: "medium" as const,
      })) as object,
      competitions: openaiRoadmap.competitionSuggestions.map((c) => ({
        name: c,
        reason: "Adds recognition and credibility.",
        priority: "high" as const,
      })) as object,
      internshipsPrograms: [] as object,
      timeline3Month: openaiRoadmap.timeline.slice(0, 1).map((t) => ({
        month: t.period,
        actions: t.actions,
        focus: t.period,
      })) as object,
      timeline6Month: openaiRoadmap.timeline.slice(0, 2).map((t) => ({
        month: t.period,
        actions: t.actions,
        focus: t.period,
      })) as object,
      timeline12Month: openaiRoadmap.timeline.map((t) => ({
        month: t.period,
        actions: t.actions,
        focus: t.period,
      })) as object,
      collegeCompetitiveness: {
        colleges: openaiRoadmap.competitivenessEstimates.map((c) => {
          const tierMap: Record<string, "reach" | "target" | "safety" | "stretch"> = {
            "Extreme Reach": "stretch",
            Reach: "reach",
            Target: "target",
            Likely: "safety",
            Safety: "safety",
          };
          return {
            name: c.collegeName,
            tier: tierMap[c.classification] ?? "reach",
            notes: c.explanation,
          };
        }),
        summary: openaiRoadmap.finalAdvice,
      } as object,
      topActions: openaiRoadmap.improvementActions.flatMap((ia) =>
        ia.actions.map((a) => ({
          action: a.actionTitle,
          impact: a.explanation,
          priority: a.impactScore,
          timeframe: a.timeHorizon,
        }))
      ).slice(0, 5) as object,
      citations: [] as object,
      admissionsStrategyOptimizer: JSON.parse(JSON.stringify(admissionsStrategyOptimizer)),
    };

    await prisma.roadmap.upsert({
      where: { studentId },
      create: { studentId, ...roadmapData },
      update: roadmapData,
    });

    return NextResponse.json({
      success: true,
      studentId,
      source,
      demoMode: demoMode ?? false,
    });
  } catch (error) {
    console.error("Analysis error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Analysis failed", details: message },
      { status: 500 }
    );
  }
}
