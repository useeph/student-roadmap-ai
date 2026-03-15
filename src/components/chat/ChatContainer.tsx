"use client";

import { useRef, useEffect } from "react";
import { ChatMessage } from "./ChatMessage";
import { TypingIndicator } from "./TypingIndicator";
import { ChatInput } from "./ChatInput";
import type { ChatMessagePayload } from "@/lib/ai/chat-roadmap";
import { SUGGESTED_QUESTIONS } from "@/lib/ai/chat-roadmap";
import { cn } from "@/lib/utils";

export interface ChatContainerProps {
  messages: Array<ChatMessagePayload & { id?: string }>;
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  showSuggestions?: boolean;
  suggestedQuestions?: string[];
  onSuggestionClick?: (question: string) => void;
  inputDisabled?: boolean;
  disclaimer?: React.ReactNode;
  className?: string;
}

export function ChatContainer({
  messages,
  onSendMessage,
  isLoading = false,
  showSuggestions = false,
  suggestedQuestions = SUGGESTED_QUESTIONS,
  onSuggestionClick,
  inputDisabled = false,
  disclaimer,
  className,
}: ChatContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages.length, isLoading]);

  return (
    <div
      className={cn(
        "flex flex-col h-[calc(100vh-12rem)] min-h-[500px] rounded-2xl border border-slate-700/50 bg-slate-900/30 overflow-hidden",
        className
      )}
    >
      {/* Scrollable messages area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-6 scroll-smooth"
      >
        {messages.map((msg, i) => (
          <ChatMessage
            key={msg.id ?? i}
            role={msg.role}
            content={msg.content}
            collegesMentioned={msg.collegesMentioned}
          />
        ))}
        {isLoading && <TypingIndicator />}
      </div>

      {/* Suggestions */}
      {showSuggestions && !isLoading && suggestedQuestions.length > 0 && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {suggestedQuestions.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => onSuggestionClick?.(q)}
              disabled={inputDisabled}
              className="text-xs px-3 py-1.5 rounded-full border border-slate-600 bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-white hover:border-slate-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-slate-700/50 bg-slate-900/20">
        <ChatInput
          onSend={onSendMessage}
          disabled={inputDisabled}
          placeholder="Ask a follow-up question..."
        />
      </div>

      {/* Disclaimer */}
      {disclaimer && (
        <div className="px-4 py-2 border-t border-slate-700/30 bg-slate-950/30 text-[11px] text-slate-500 text-center">
          {disclaimer}
        </div>
      )}
    </div>
  );
}
