import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
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
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = profileSchema.parse(body);

    const profile = await prisma.studentProfile.create({
      data: {
        name: data.name,
        age: data.age,
        gradeLevel: data.gradeLevel,
        graduationYear: data.graduationYear,
        gpa: data.gpa,
        currentClasses: data.currentClasses,
        intendedMajors: data.intendedMajors,
        intendedIndustry: data.intendedIndustry,
        targetColleges: data.targetColleges,
        interests: data.interests,
        extracurriculars: data.extracurriculars,
        awards: data.awards,
        leadershipExp: data.leadershipExp,
        githubUrl: data.githubUrl || null,
        portfolioUrl: data.portfolioUrl || null,
        hoursPerWeek: data.hoursPerWeek,
        constraints: data.constraints,
        goals: data.goals,
        testScores: data.testScores ?? undefined,
      },
    });

    return NextResponse.json({ id: profile.id, profile });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Profile creation error:", error);
    return NextResponse.json(
      { error: "Failed to create profile" },
      { status: 500 }
    );
  }
}
