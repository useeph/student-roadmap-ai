import { NextResponse } from "next/server";
import OpenAI from "openai";
import { prisma } from "@/lib/db";
import type { StudentProfileInput } from "@/types";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

function createClient(): OpenAI | null {
  if (!OPENAI_API_KEY?.trim()) return null;
  return new OpenAI({ apiKey: OPENAI_API_KEY });
}

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
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    const userMessage = typeof body?.message === "string" ? body.message.trim() : null;

    if (!studentId || !userMessage) {
      return NextResponse.json(
        { error: "studentId and message are required" },
        { status: 400 }
      );
    }

    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      include: { roadmap: true },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    const profile = profileFromStudent(student);
    const roadmap = student.roadmap;

    const contextParts: string[] = [
      "## Student Profile",
      `- Name: ${profile.name}`,
      profile.gradeLevel ? `- Grade: ${profile.gradeLevel}` : "",
      profile.graduationYear ? `- Graduation: ${profile.graduationYear}` : "",
      profile.intendedMajors?.length ? `- Intended majors: ${profile.intendedMajors.join(", ")}` : "",
      profile.targetColleges?.length ? `- Target colleges: ${profile.targetColleges.join(", ")}` : "",
      profile.interests?.length ? `- Interests: ${profile.interests.join(", ")}` : "",
      profile.extracurriculars?.length ? `- Extracurriculars: ${profile.extracurriculars.join(", ")}` : "",
      profile.awards?.length ? `- Awards: ${profile.awards.join(", ")}` : "",
      profile.goals ? `- Goals: ${profile.goals}` : "",
    ].filter(Boolean);

    if (roadmap) {
      const roadmapParts = [
        "",
        "## Roadmap Summary",
        roadmap.studentSummary ? `- Summary: ${roadmap.studentSummary}` : "",
        roadmap.strengthsAnalysis ? `- Strengths: ${roadmap.strengthsAnalysis}` : "",
        roadmap.gapsAnalysis ? `- Gaps: ${roadmap.gapsAnalysis}` : "",
        roadmap.collegeCompetitiveness
          ? `- College competitiveness: ${JSON.stringify(roadmap.collegeCompetitiveness)}`
          : "",
      ].filter(Boolean);
      contextParts.push(...roadmapParts);
    }

    const systemContent = `You are an expert admissions strategist helping a student with their college application roadmap. Use the following context about the student and their roadmap to answer their questions. Be conversational, supportive, and specific. If you mention colleges, use their full or common names (e.g., MIT, Stanford).

${contextParts.join("\n")}`;

    const client = createClient();
    if (!client) {
      return NextResponse.json(
        {
          reply: "I'm unable to answer follow-up questions right now because the AI service isn't configured. You can still review your roadmap above—it has all the key recommendations!",
        },
        { status: 200 }
      );
    }

    const chatMessages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
      { role: "system", content: systemContent },
      ...messages.slice(-10).map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user", content: userMessage },
    ];

    const completion = await client.chat.completions.create({
      model: OPENAI_MODEL,
      messages: chatMessages,
      temperature: 0.7,
      max_tokens: 800,
    });

    const reply = completion.choices[0]?.message?.content?.trim() ?? "I couldn't generate a response. Please try again.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat API error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to get response", details: message },
      { status: 500 }
    );
  }
}
