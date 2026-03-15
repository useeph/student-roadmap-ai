"use client";

import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

export function TypingIndicator({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex gap-3 opacity-0 animate-fade-in-up animate-duration-200",
        className
      )}
    >
      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-slate-300">
        <GraduationCap className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="rounded-2xl px-4 py-3 bg-slate-800/80 border border-slate-700/50 inline-flex gap-1.5">
          <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce [animation-delay:0ms]" />
          <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce [animation-delay:150ms]" />
          <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}
