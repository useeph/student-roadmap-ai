import { NextResponse } from "next/server";
import { auth } from "@/auth";
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

/** GET current user's student profile (id + fields for intake prefill) */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) {
    return NextResponse.json({ profile: null });
  }

  return NextResponse.json({
    id: profile.id,
    profile: {
      name: profile.name,
      age: profile.age ?? undefined,
      gradeLevel: profile.gradeLevel ?? undefined,
      graduationYear: profile.graduationYear ?? undefined,
      gpa: profile.gpa ?? undefined,
      currentClasses: profile.currentClasses,
      intendedMajors: profile.intendedMajors,
      intendedIndustry: profile.intendedIndustry ?? undefined,
      targetColleges: profile.targetColleges,
      interests: profile.interests,
      extracurriculars: profile.extracurriculars,
      awards: profile.awards,
      leadershipExp: profile.leadershipExp,
      githubUrl: profile.githubUrl ?? undefined,
      portfolioUrl: profile.portfolioUrl ?? undefined,
      hoursPerWeek: profile.hoursPerWeek ?? undefined,
      constraints: profile.constraints ?? undefined,
      goals: profile.goals ?? undefined,
      testScores: (profile.testScores as Record<string, unknown>) ?? {},
    },
  });
}

/** Create or update the authenticated user's profile */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = profileSchema.parse(body);

    const existing = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
    });

    const payload = {
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
    };

    const profile = existing
      ? await prisma.studentProfile.update({
          where: { id: existing.id },
          data: payload,
        })
      : await prisma.studentProfile.create({
          data: {
            ...payload,
            userId: session.user.id,
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
    console.error("Profile save error:", error);
    return NextResponse.json(
      { error: "Failed to save profile" },
      { status: 500 }
    );
  }
}
