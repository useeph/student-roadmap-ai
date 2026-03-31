"use client";

import { use, useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, GraduationCap, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { RoadmapSectionTabs, useSectionInView } from "@/components/chat/RoadmapSectionTabs";
import {
  roadmapToChatMessages,
  type ChatMessagePayload,
  type RoadmapData as RoadmapContent,
  type RoadmapSectionId,
  SUGGESTED_QUESTIONS,
  ROADMAP_SECTIONS,
} from "@/lib/ai/chat-roadmap";
import type { RoadmapOutput } from "@/types";

const MESSAGE_DELAY_MS = 600;

interface RoadmapPageData {
  student: {
    id: string;
    name: string;
    gradeLevel?: string | null;
    graduationYear?: number | null;
    intendedMajors?: string[];
    targetColleges?: string[];
  };
  roadmap: RoadmapOutput;
}

export default function RoadmapPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<RoadmapPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [messages, setMessages] = useState<Array<ChatMessagePayload & { id: string }>>([]);
  const [streamingIndex, setStreamingIndex] = useState(0);
  const [streamingComplete, setStreamingComplete] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const roadmapMessages = data
    ? roadmapToChatMessages(
        data.roadmap as unknown as RoadmapContent,
        data.student.name,
        data.student.intendedMajors ?? [],
        data.student.targetColleges ?? []
      )
    : [];

  useEffect(() => {
    if (!id) return;

    const fetchRoadmap = async () => {
      try {
        const res = await fetch(`/api/roadmap/${id}`);
        const json = await res.json();
        if (!res.ok) {
          setError(json.error ?? "Failed to load");
          return;
        }

        if (json.hasRoadmap && json.roadmap) {
          setData({ student: json.student, roadmap: json.roadmap });
        } else {
          setAnalyzing(true);
          const analyzeRes = await fetch("/api/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ studentId: id }),
          });
          const analyzeJson = await analyzeRes.json();
          if (!analyzeRes.ok) {
            const detail = analyzeJson.details ? `: ${analyzeJson.details}` : "";
            setError((analyzeJson.error ?? "Analysis failed") + detail);
            return;
          }

          const refetch = await fetch(`/api/roadmap/${id}`);
          const refetchJson = await refetch.json();
          if (refetchJson.hasRoadmap && refetchJson.roadmap) {
            setData({ student: refetchJson.student, roadmap: refetchJson.roadmap });
          } else {
            setError("Roadmap generation did not complete");
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
        setAnalyzing(false);
      }
    };

    fetchRoadmap();
  }, [id]);

  useEffect(() => {
    if (roadmapMessages.length === 0 || streamingIndex >= roadmapMessages.length) {
      if (roadmapMessages.length > 0 && streamingIndex >= roadmapMessages.length) {
        setStreamingComplete(true);
      }
      return;
    }

    const timeout = setTimeout(() => {
      const next = roadmapMessages[streamingIndex];
      setMessages((prev) => [
        ...prev,
        { ...next, id: `roadmap-${streamingIndex}-${Date.now()}` },
      ]);
      setStreamingIndex((i) => i + 1);
    }, MESSAGE_DELAY_MS);

    return () => clearTimeout(timeout);
  }, [roadmapMessages, streamingIndex]);

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!data) return;

      const userMsg: ChatMessagePayload & { id: string } = {
        role: "user",
        content,
        id: `user-${Date.now()}`,
      };
      setMessages((prev) => [...prev, userMsg]);
      setChatLoading(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId: data.student.id,
            message: content,
            messages: [...messages, userMsg].map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        const json = await res.json();
        const reply = json.reply ?? (json.error ? `Error: ${json.error}` : "Sorry, I couldn't generate a response.");

        const assistantMsg: ChatMessagePayload & { id: string } = {
          role: "assistant",
          content: reply,
          id: `assistant-${Date.now()}`,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : "Something went wrong";
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `I encountered an error: ${errMsg}. Please try again.`,
            id: `error-${Date.now()}`,
          },
        ]);
      } finally {
        setChatLoading(false);
      }
    },
    [data, messages]
  );

  const handleSuggestionClick = useCallback(
    (question: string) => {
      handleSendMessage(question);
    },
    [handleSendMessage]
  );

  const suggestedQuestions = (() => {
    const base = [...SUGGESTED_QUESTIONS];
    const colleges = data?.student.targetColleges ?? [];
    if (colleges.length) {
      const first = colleges[0];
      base[3] = `How realistic is ${first} for me?`;
    }
    return base;
  })();

  const collegeQuestion = (() => {
    const colleges = data?.student.targetColleges ?? [];
    return colleges.length ? `How realistic is ${colleges[0]} for me?` : "How realistic is MIT for me?";
  })();

  const availableSections = roadmapMessages
    .map((m) => m.section)
    .filter((s): s is RoadmapSectionId => !!s);

  const activeSection = useSectionInView(scrollContainerRef, availableSections);

  const handleTabClick = useCallback(
    (section: RoadmapSectionId) => {
      const hasSection = messages.some((m) => m.section === section);
      if (hasSection) {
        const el = document.getElementById(`section-${section}`);
        el?.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        const config = ROADMAP_SECTIONS.find((s) => s.id === section);
        const question = section === "college" ? collegeQuestion : (config?.defaultQuestion ?? SUGGESTED_QUESTIONS[0]);
        handleSendMessage(question);
      }
    },
    [messages, collegeQuestion, handleSendMessage]
  );

  if (loading || analyzing) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-indigo-400 animate-spin mx-auto mb-4" />
          <p className="text-white font-medium">
            {analyzing ? "Generating your roadmap..." : "Loading..."}
          </p>
          <p className="text-slate-400 text-sm mt-1">
            {analyzing ? "Analyzing your profile and building recommendations" : "Please wait"}
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <p className="text-red-400 mb-4">{error ?? "Not found"}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/dashboard">
              <Button variant="outline">Dashboard</Button>
            </Link>
            <Link href="/intake">
              <Button variant="outline">Edit profile</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Home
          </Link>
          <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">
            Dashboard
          </Link>
        </div>

        <header className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap className="h-7 w-7 text-indigo-400" />
            <h1 className="text-xl font-bold text-white">Your admissions strategy</h1>
          </div>
          <p className="text-slate-400 text-sm">
            {data.student.name}
            {data.student.gradeLevel && ` • ${data.student.gradeLevel}`}
            {data.student.graduationYear && ` • Class of ${data.student.graduationYear}`}
          </p>
        </header>

        {/* Section tabs */}
        {data && (
          <div className="mb-4">
            <RoadmapSectionTabs
              availableSections={availableSections}
              activeSection={activeSection}
              collegeQuestion={collegeQuestion}
              onTabClick={handleTabClick}
            />
          </div>
        )}

        <ChatContainer
          messages={messages}
          onSendMessage={handleSendMessage}
          scrollContainerRef={scrollContainerRef}
          isLoading={streamingIndex < roadmapMessages.length || chatLoading}
          showSuggestions={streamingIndex >= roadmapMessages.length && !chatLoading}
          suggestedQuestions={suggestedQuestions}
          onSuggestionClick={handleSuggestionClick}
          inputDisabled={streamingIndex < roadmapMessages.length}
          disclaimer="Admissions guidance is advisory only. Outcomes are not guaranteed."
        />
      </div>
    </div>
  );
}
