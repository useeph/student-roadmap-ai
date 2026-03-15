"use client";

import { useMemo } from "react";
import { Gauge } from "lucide-react";
import type { StudentProfileInput } from "@/types";
import { calculateProfileStrength } from "@/lib/profileStrength";

export function ProfileStrengthMeter({ profile }: { profile: StudentProfileInput }) {
  const strength = useMemo(() => calculateProfileStrength(profile), [profile]);
  const pct = Math.min(100, strength.total);
  const color = pct >= 70 ? "emerald" : pct >= 50 ? "amber" : "rose";

  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Gauge className="h-5 w-5 text-indigo-400" />
        <h3 className="text-lg font-semibold text-white">Profile strength</h3>
        <span className={`ml-auto text-2xl font-bold ${
          color === "emerald" ? "text-emerald-400" :
          color === "amber" ? "text-amber-400" : "text-rose-400"
        }`}>
          {strength.total}%
        </span>
      </div>
      <div className="h-3 rounded-full bg-slate-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${
            color === "emerald" ? "bg-emerald-500" :
            color === "amber" ? "bg-amber-500" : "bg-rose-500"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-slate-500 mt-2">
        Based on GPA, course rigor, extracurriculars, leadership, projects, and awards
      </p>
    </div>
  );
}
