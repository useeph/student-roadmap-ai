import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { profileBelongsToUser } from "@/lib/auth-helpers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const allowed = await profileBelongsToUser(id, session.user.id);
    if (!allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

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
