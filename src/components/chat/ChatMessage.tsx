"use client";

import { useState } from "react";
import { GraduationCap, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { getUniversityLogoUrl, getUniversityInitial } from "@/lib/university-logos";

export interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  collegesMentioned?: string[];
  className?: string;
}

function UniversityLogoBadge({ name }: { name: string }) {
  const url = getUniversityLogoUrl(name);
  const initial = getUniversityInitial(name);
  const [imageError, setImageError] = useState(false);

  if (url && !imageError) {
    return (
      <img
        src={url}
        alt={name}
        className="h-6 w-6 rounded-full object-cover border border-slate-600/50 shrink-0"
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <span
      className="h-6 w-6 shrink-0 rounded-full bg-indigo-500/30 flex items-center justify-center text-[10px] font-semibold text-indigo-300 border border-indigo-500/30"
      title={name}
    >
      {initial}
    </span>
  );
}

export function ChatMessage({
  role,
  content,
  collegesMentioned,
  className,
}: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 animate-fade-in-up",
        isUser ? "flex-row-reverse" : "",
        className
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center",
          isUser
            ? "bg-indigo-500/30 text-indigo-300"
            : "bg-slate-700 text-slate-300"
        )}
      >
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <GraduationCap className="h-4 w-4" />
        )}
      </div>

      {/* Content */}
      <div
        className={cn(
          "flex-1 min-w-0 max-w-[85%]",
          isUser ? "flex flex-col items-end" : ""
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-relaxed",
            isUser
              ? "bg-indigo-600/40 text-white border border-indigo-500/30"
              : "bg-slate-800/80 text-slate-200 border border-slate-700/50"
          )}
        >
          <div className="prose prose-invert prose-sm max-w-none [&_ul]:my-2 [&_li]:my-0.5 [&_strong]:text-white [&_strong]:font-semibold">
            <ReactMarkdown
              components={{
                ul: ({ children }) => (
                  <ul className="list-disc list-inside space-y-1 my-2">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside space-y-1 my-2">{children}</ol>
                ),
                li: ({ children }) => <li className="text-inherit">{children}</li>,
                p: ({ children }) => <p className="my-2 first:mt-0 last:mb-0">{children}</p>,
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>

        {/* University logos for AI messages mentioning colleges */}
        {!isUser && collegesMentioned && collegesMentioned.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {collegesMentioned.slice(0, 5).map((name) => (
              <div key={name} className="flex items-center gap-1">
                <UniversityLogoBadge name={name} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
