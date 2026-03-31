import { NextResponse } from "next/server";
import OpenAI from "openai";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { profileBelongsToUser } from "@/lib/auth-helpers";
import { buildChatSystemPrompt } from "@/lib/ai/build-chat-prompt";
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
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
        { error: "Student not found" },
        { status: 404 }
      );
    }

    const profile = profileFromStudent(student);
    const roadmap = student.roadmap;

    const systemContent = buildChatSystemPrompt({
      profile,
      roadmap,
      recentMessages: messages.slice(-10),
      currentQuestion: userMessage,
    });

    const client = createClient();
    if (!client) {
      return NextResponse.json(
        {
          reply: "I'm unable to answer follow-up questions right now because the AI service isn't configured. You can still review your roadmap above—it has all the key recommendations!",
        },
        { status: 200 }
      );
    }

    // Use messages as-is; last item is the current user message (client sends [...messages, userMsg])
    const chatMessages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
      { role: "system", content: systemContent },
      ...messages.slice(-12).map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: String(m.content ?? ""),
      })),
    ];

    // If the last message in the slice isn't the current user message, append it (backwards compat)
    const lastMsg = chatMessages[chatMessages.length - 1];
    if (lastMsg?.role !== "user" || lastMsg?.content !== userMessage) {
      chatMessages.push({ role: "user", content: userMessage });
    }

    const completion = await client.chat.completions.create({
      model: OPENAI_MODEL,
      messages: chatMessages,
      temperature: 0.6,
      max_tokens: 800,
      frequency_penalty: 0.3,
      presence_penalty: 0.2,
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
