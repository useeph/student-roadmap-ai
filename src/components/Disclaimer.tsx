"use client";

import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export function Disclaimer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200/90",
        className
      )}
      role="alert"
    >
      <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" aria-hidden />
      <div>
        <p className="font-medium text-amber-200">Guidance only — no guarantees</p>
        <p className="mt-1 text-amber-200/80">
          All outputs are for informational and planning purposes only. This platform does not
          guarantee admission to any college, program, internship, or competition. Outcomes depend
          on many factors beyond what can be modeled here. Always consult counselors, admissions
          offices, and official program guidelines.
        </p>
      </div>
    </div>
  );
}
