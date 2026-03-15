"use client";

import { useMemo } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import type { StudentProfileInput } from "@/types";
import { calculateProfileStrength } from "@/lib/profileStrength";

export function StrengthRadarChart({ profile }: { profile: StudentProfileInput }) {
  const strength = useMemo(() => calculateProfileStrength(profile), [profile]);

  const data = useMemo(
    () => [
      { subject: "Academics", value: strength.academics, fullMark: 100 },
      { subject: "Leadership", value: strength.leadership, fullMark: 100 },
      { subject: "Projects", value: strength.projects, fullMark: 100 },
      { subject: "Impact", value: strength.impact, fullMark: 100 },
      { subject: "Competitions", value: strength.competitions, fullMark: 100 },
    ],
    [strength]
  );

  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-6 h-[280px]">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-semibold text-white">Strength profile</h3>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="rgba(148, 163, 184, 0.3)" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "#94a3b8", fontSize: 11 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: "#64748b", fontSize: 10 }}
          />
          <Radar
            name="Score"
            dataKey="value"
            stroke="#6366f1"
            fill="#6366f1"
            fillOpacity={0.4}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
