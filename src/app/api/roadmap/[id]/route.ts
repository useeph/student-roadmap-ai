import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const student = await prisma.studentProfile.findUnique({
      where: { id },
      include: { roadmap: true },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    const studentPayload = {
      id: student.id,
      name: student.name,
      gradeLevel: student.gradeLevel,
      graduationYear: student.graduationYear,
      intendedMajors: student.intendedMajors,
      targetColleges: student.targetColleges,
    };

    if (!student.roadmap) {
      return NextResponse.json({
        student: studentPayload,
        roadmap: null,
        hasRoadmap: false,
      });
    }

    return NextResponse.json({
      student: studentPayload,
      roadmap: student.roadmap,
      hasRoadmap: true,
    });
  } catch (error) {
    console.error("Roadmap fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch roadmap" },
      { status: 500 }
    );
  }
}
