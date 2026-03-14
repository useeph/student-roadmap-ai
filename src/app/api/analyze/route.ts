import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { runAnalysis } from "@/lib/analysis";
import { runAdmissionsStrategyOptimizer } from "@/lib/optimizer";

export async function POST(request: Request) {
  try {
    const { studentId } = await request.json();
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

    const input = {
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
      testScores: student.testScores as
        | { sat?: number; act?: number; apScores?: number[] }
        | undefined,
    };

    const analysis = await runAnalysis(input);
    const admissionsStrategyOptimizer = runAdmissionsStrategyOptimizer(input);

    const roadmapData = {
      studentSummary: analysis.studentSummary,
      strengthsAnalysis: analysis.strengthsAnalysis,
      gapsAnalysis: analysis.gapsAnalysis,
      recommendedExtracurriculars: analysis.recommendedExtracurriculars as object,
      recommendedProjects: analysis.recommendedProjects as object,
      courseworkSuggestions: analysis.courseworkSuggestions as object,
      competitions: analysis.competitions as object,
      internshipsPrograms: analysis.internshipsPrograms as object,
      timeline3Month: analysis.timeline3Month as object,
      timeline6Month: analysis.timeline6Month as object,
      timeline12Month: analysis.timeline12Month as object,
      collegeCompetitiveness: analysis.collegeCompetitiveness as object,
      topActions: analysis.topActions as object,
      citations: analysis.citations as object,
      admissionsStrategyOptimizer: JSON.parse(JSON.stringify(admissionsStrategyOptimizer)),
    };

    await prisma.roadmap.upsert({
      where: { studentId },
      create: { studentId, ...roadmapData },
      update: roadmapData,
    });

    return NextResponse.json({ success: true, studentId });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "Analysis failed" },
      { status: 500 }
    );
  }
}
