import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { profileBelongsToUser } from "@/lib/auth-helpers";
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
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const studentId = typeof body?.studentId === "string" ? body.studentId : null;

    if (!studentId) {
      return NextResponse.json(
        { error: "studentId is required" },
        { status: 400 }
      );
    }

    const allowed = await profileBelongsToUser(studentId, session.user.id);
    if (!allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
    const extracurriculars = openaiRoadmap.extracurriculars ?? [];
    const projects = openaiRoadmap.projects ?? [];
    const collegeChances = openaiRoadmap.collegeChances ?? [];

    const roadmapData = {
      studentSummary: openaiRoadmap.studentSummary ?? openaiRoadmap.strategy?.summary ?? "",
      strengthsAnalysis: strengths.join(" "),
      gapsAnalysis: gaps.join(" "),
      recommendedExtracurriculars: extracurriculars.map((r) => ({
        name: r.title,
        reason: r.reason,
        priority: r.priority.toLowerCase() as "high" | "medium" | "low",
      })),
      recommendedProjects: projects.map((p) => ({
        name: p.title,
        reason: p.description,
        priority: "high" as const,
      })),
      courseworkSuggestions: [],
      competitions: [],
      internshipsPrograms: [],
      timeline3Month: (openaiRoadmap.timeline ?? []).slice(0, 1).map((t) => ({
        month: t.period,
        actions: t.actions,
        focus: t.period,
      })),
      timeline6Month: (openaiRoadmap.timeline ?? []).slice(0, 2).map((t) => ({
        month: t.period,
        actions: t.actions,
        focus: t.period,
      })),
      timeline12Month: (openaiRoadmap.timeline ?? []).map((t) => ({
        month: t.period,
        actions: t.actions,
        focus: t.period,
      })),
      collegeCompetitiveness: {
        colleges: collegeChances.map((c) => {
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
        summary: openaiRoadmap.finalAdvice ?? openaiRoadmap.strategy?.summary ?? "",
      },
      topActions: (openaiRoadmap.improvementActions ?? []).flatMap((ia) =>
        ia.actions.map((a) => ({
          action: a.actionTitle,
          impact: a.explanation,
          priority: a.impactScore,
          timeframe: a.timeHorizon,
        }))
      ).slice(0, 5),
      citations: [],
      admissionsStrategyOptimizer,
      strategySection: openaiRoadmap.strategy ?? null,
      essayIdeasSection: openaiRoadmap.essayIdeas?.length ? openaiRoadmap.essayIdeas : null,
    };

    // Sanitize all Json fields to avoid undefined/non-serializable values that break Prisma
    const toJson = (v: unknown): Prisma.InputJsonValue =>
      JSON.parse(JSON.stringify(v ?? null)) as Prisma.InputJsonValue;
    const jsonNull = Prisma.JsonNull as unknown as Prisma.InputJsonValue;

    const roadmapPayload = {
      studentSummary: roadmapData.studentSummary,
      strengthsAnalysis: roadmapData.strengthsAnalysis,
      gapsAnalysis: roadmapData.gapsAnalysis,
      recommendedExtracurriculars: toJson(roadmapData.recommendedExtracurriculars),
      recommendedProjects: toJson(roadmapData.recommendedProjects),
      courseworkSuggestions: toJson(roadmapData.courseworkSuggestions),
      competitions: toJson(roadmapData.competitions),
      internshipsPrograms: toJson(roadmapData.internshipsPrograms),
      timeline3Month: toJson(roadmapData.timeline3Month),
      timeline6Month: toJson(roadmapData.timeline6Month),
      timeline12Month: toJson(roadmapData.timeline12Month),
      collegeCompetitiveness: toJson(roadmapData.collegeCompetitiveness),
      topActions: toJson(roadmapData.topActions),
      citations: toJson(roadmapData.citations),
      admissionsStrategyOptimizer: toJson(roadmapData.admissionsStrategyOptimizer),
      strategySection: roadmapData.strategySection
        ? toJson(roadmapData.strategySection)
        : jsonNull,
      essayIdeasSection: roadmapData.essayIdeasSection
        ? toJson(roadmapData.essayIdeasSection)
        : jsonNull,
    };

    await prisma.roadmap.upsert({
      where: { studentId },
      create: { studentId, ...roadmapPayload },
      update: roadmapPayload,
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
