/**
 * POST /api/generate-roadmap
 * Accepts full student profile, generates roadmap via OpenAI, optionally saves to DB.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { generateRoadmapWithOpenAI } from "@/lib/ai/openai-client";
import { runAdmissionsStrategyOptimizer } from "@/lib/optimizer";
import type { StudentProfileInput } from "@/types";

const profileSchema = z.object({
  name: z.string().min(1),
  age: z.number().int().min(10).max(25).optional(),
  gradeLevel: z.string().optional(),
  graduationYear: z.number().int().optional(),
  gpa: z.number().min(0).max(5).optional(),
  currentClasses: z.array(z.string()).optional().default([]),
  intendedMajors: z.array(z.string()).optional().default([]),
  intendedIndustry: z.string().optional(),
  targetColleges: z.array(z.string()).optional().default([]),
  interests: z.array(z.string()).optional().default([]),
  extracurriculars: z.array(z.string()).optional().default([]),
  awards: z.array(z.string()).optional().default([]),
  leadershipExp: z.array(z.string()).optional().default([]),
  githubUrl: z.string().url().optional().or(z.literal("")),
  portfolioUrl: z.string().url().optional().or(z.literal("")),
  hoursPerWeek: z.number().min(0).max(168).optional(),
  constraints: z.string().optional(),
  goals: z.string().optional(),
  testScores: z
    .object({
      sat: z.number().optional(),
      act: z.number().optional(),
      apScores: z.array(z.number()).optional(),
    })
    .optional(),
  studentId: z.string().optional(), // If provided, save roadmap to DB
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = profileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid profile", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { studentId, ...profileInput } = parsed.data;
    const profile: StudentProfileInput = profileInput;

    const { roadmap: openaiRoadmap, source, demoMode } =
      await generateRoadmapWithOpenAI(profile);

    const admissionsStrategyOptimizer = studentId
      ? runAdmissionsStrategyOptimizer(profile)
      : [];

    const tierMap: Record<string, "reach" | "target" | "safety" | "stretch"> = {
      "Extreme Reach": "stretch",
      Reach: "reach",
      Target: "target",
      Likely: "safety",
      Safety: "safety",
    };

    const response = {
      roadmap: openaiRoadmap,
      admissionsStrategyOptimizer:
        admissionsStrategyOptimizer.length > 0 ? admissionsStrategyOptimizer : undefined,
      source,
      demoMode: demoMode ?? false,
    };

    if (studentId) {
      const student = await prisma.studentProfile.findUnique({
        where: { id: studentId },
      });

      if (student) {
        const roadmapData = {
          studentSummary: openaiRoadmap.studentSummary,
          strengthsAnalysis: openaiRoadmap.strengths.join(" "),
          gapsAnalysis: openaiRoadmap.gaps.join(" "),
          recommendedExtracurriculars: openaiRoadmap.extracurricularRecommendations.map(
            (r) => ({
              name: r.title,
              reason: r.reason,
              priority: r.priority.toLowerCase(),
            })
          ) as object,
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
            reason: "Adds recognition.",
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
            colleges: openaiRoadmap.competitivenessEstimates.map((c) => ({
              name: c.collegeName,
              tier: tierMap[c.classification] ?? "reach",
              notes: c.explanation,
            })),
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
          admissionsStrategyOptimizer: JSON.parse(
            JSON.stringify(admissionsStrategyOptimizer)
          ),
          openaiRoadmap: JSON.parse(JSON.stringify(openaiRoadmap)) as object,
        };

        await prisma.roadmap.upsert({
          where: { studentId },
          create: { studentId, ...roadmapData },
          update: roadmapData,
        });
      }
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Generate roadmap error:", error);
    return NextResponse.json(
      { error: "Failed to generate roadmap" },
      { status: 500 }
    );
  }
}
