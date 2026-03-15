/**
 * Profile strength calculation from GPA, rigor, extracurriculars, leadership, projects, awards.
 * Returns 0-100 score and per-dimension scores for radar chart.
 */

import type { StudentProfileInput } from "@/types";

const RIGOR_KEYWORDS = ["ap ", "ib ", "honors", "calculus", "physics", "chemistry", "biology", "computer science"];

function hasRigor(classes: string[]): number {
  if (!classes?.length) return 0;
  const count = classes.filter((c) =>
    RIGOR_KEYWORDS.some((k) => c.toLowerCase().includes(k))
  ).length;
  return Math.min(100, count * 25); // 4+ rigorous = 100
}

export function calculateProfileStrength(profile: StudentProfileInput): {
  total: number;
  academics: number;
  leadership: number;
  projects: number;
  impact: number;
  competitions: number;
} {
  const gpa = profile.gpa ?? 0;
  const classes = profile.currentClasses ?? [];
  const extracurriculars = profile.extracurriculars ?? [];
  const leadership = profile.leadershipExp ?? [];
  const awards = profile.awards ?? [];
  const hasGitHub = Boolean(profile.githubUrl?.trim());
  const hasPortfolio = Boolean(profile.portfolioUrl?.trim());

  // Academics: GPA (60) + rigor (40)
  const gpaScore = gpa >= 4 ? 60 : gpa >= 3.5 ? 45 : gpa >= 3 ? 30 : gpa >= 2.5 ? 15 : 0;
  const rigorScore = hasRigor(classes);
  const academics = Math.min(100, Math.round(gpaScore + (rigorScore * 0.4)));

  // Leadership: count of roles
  const leadershipScore = Math.min(100, leadership.length * 33);

  // Projects: GitHub + portfolio
  const projectsScore = (hasGitHub ? 50 : 0) + (hasPortfolio ? 50 : 0);

  // Impact: extracurriculars depth
  const impactScore = Math.min(100, extracurriculars.length * 20);

  // Competitions: awards
  const compScore = Math.min(100, awards.length * 25);

  const total = Math.round(
    (academics * 0.25) +
    (leadershipScore * 0.2) +
    (projectsScore * 0.2) +
    (impactScore * 0.2) +
    (compScore * 0.15)
  );

  return {
    total: Math.min(100, total),
    academics: Math.min(100, academics),
    leadership: Math.min(100, leadershipScore),
    projects: Math.min(100, projectsScore),
    impact: Math.min(100, impactScore),
    competitions: Math.min(100, compScore),
  };
}
