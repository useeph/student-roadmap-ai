/**
 * Converts roadmap JSON into conversational chat messages.
 * Feels like a real AI admissions strategist—conversational, not pasted JSON.
 */

import type { CollegeEstimate, Recommendation } from "@/types";

/** Section ID for roadmap navigation tabs */
export type RoadmapSectionId = "strategy" | "projects" | "extracurriculars" | "college" | "essay";

export interface ChatMessagePayload {
  role: "user" | "assistant";
  content: string;
  collegesMentioned?: string[];
  /** Section ID when this message corresponds to a roadmap section tab */
  section?: RoadmapSectionId;
}

/** Strategy section from DB - supports structured and legacy format */
export interface StrategySection {
  summary?: string;
  overview?: string;
  topPriorities?: Array<string | { title: string; reason?: string; impact?: string }>;
}

/** Essay idea from DB */
export interface EssayIdea {
  theme: string;
  storyOutline?: string;
  whatItReveals?: string;
  whyItIsCompelling?: string;
  description?: string;
  whyCompelling?: string;
}

/** Roadmap data from API/DB */
export interface RoadmapData {
  studentSummary?: string;
  strengthsAnalysis?: string;
  gapsAnalysis?: string;
  recommendedExtracurriculars?: Recommendation[];
  recommendedProjects?: Recommendation[];
  courseworkSuggestions?: Recommendation[];
  competitions?: Recommendation[];
  internshipsPrograms?: Recommendation[];
  timeline3Month?: { month?: string; actions?: string[]; focus?: string }[];
  timeline6Month?: { month?: string; actions?: string[]; focus?: string }[];
  timeline12Month?: { month?: string; actions?: string[]; focus?: string }[];
  collegeCompetitiveness?: { colleges: CollegeEstimate[]; summary?: string };
  topActions?: { action: string; impact: string; priority: number; timeframe?: string }[];
  strategySection?: StrategySection;
  essayIdeasSection?: EssayIdea[];
}

function formatBullets(items: string[]): string {
  if (!items.length) return "";
  return items.map((item) => `• ${item}`).join("\n");
}

function formatProjects(items: Recommendation[] | undefined): string {
  if (!items?.length) return "";
  return items
    .map((r) => `• **${r.name}**\n  ${r.reason}`)
    .join("\n\n");
}

function formatExtracurriculars(items: Recommendation[] | undefined): string {
  if (!items?.length) return "";
  return items.map((r) => `• **${r.name}** — ${r.reason}`).join("\n");
}

function formatCollegeChances(
  colleges: CollegeEstimate[] | undefined,
  topTargetNames?: string[]
): string {
  if (!colleges?.length) return "";
  const tierLabels: Record<string, string> = {
    reach: "Reach",
    stretch: "Stretch",
    target: "Target",
    safety: "Safety",
  };
  const intro =
    topTargetNames?.length && topTargetNames.length > 0
      ? `For **${topTargetNames.slice(0, 3).join("**, **")}**${topTargetNames.length > 3 ? ", and others" : ""}, here's how I see your competitiveness:\n\n`
      : "Here's how I see your competitiveness for your target schools:\n\n";
  const lines = colleges.map(
    (c) => `• **${c.name}** — ${tierLabels[c.tier] ?? c.tier}${c.notes ? `: ${c.notes}` : ""}`
  );
  return intro + lines.join("\n");
}

function formatTimeline(
  items: { month?: string; actions?: string[]; focus?: string }[] | undefined
): string {
  if (!items?.length) return "";
  return items
    .map((t) => {
      const label = t.month ?? t.focus ?? "Period";
      const actions = Array.isArray(t.actions) ? t.actions.map((a) => `  • ${a}`).join("\n") : "";
      return `**${label}**\n${actions}`;
    })
    .join("\n\n");
}

function formatStrategyPriorities(
  priorities: Array<string | { title: string; reason?: string; impact?: string }> | undefined
): string {
  if (!priorities?.length) return "";
  return priorities
    .map((p) => {
      if (typeof p === "string") return `• ${p}`;
      return `• **${p.title}**${p.reason ? ` — ${p.reason}` : ""}`;
    })
    .join("\n");
}

function formatEssayIdeas(ideas: EssayIdea[] | undefined): string {
  if (!ideas?.length) return "";
  return ideas
    .map((e) => {
      const outline = e.storyOutline ?? e.description ?? "";
      const reveals = e.whatItReveals ? ` It reveals ${e.whatItReveals}.` : "";
      const compelling = e.whyItIsCompelling ?? e.whyCompelling ?? "";
      return `• **${e.theme}** — ${outline}${reveals} ${compelling}`;
    })
    .join("\n\n");
}

function parseBulletList(text: string | undefined): string[] {
  if (!text?.trim()) return [];
  const bulletSplit = text.split(/\s*[•·]\s*/).filter(Boolean);
  if (bulletSplit.length > 1) return bulletSplit.map((s) => s.trim()).filter(Boolean);
  const sentenceSplit = text
    .split(/(?<=[.!])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (sentenceSplit.length > 1) return sentenceSplit;
  const commaSplit = text.split(/\s*,\s*/).map((s) => s.trim()).filter(Boolean);
  if (commaSplit.length > 1) return commaSplit;
  return [text.trim()];
}

export function buildGreetingMessage(
  studentName: string,
  majors: string[],
  targetColleges: string[]
): ChatMessagePayload {
  const majorStr = majors?.length ? majors.join(" and ") : "your intended field";
  const collegeStr =
    targetColleges?.length > 0
      ? targetColleges.slice(0, 3).join(", ")
      : "top universities";
  const intro =
    targetColleges?.length > 0
      ? `Hi ${studentName}! I've analyzed your profile and your goal of studying **${majorStr}** at schools like **${collegeStr}**. Here's what I found.`
      : `Hi ${studentName}! I've analyzed your profile and your goal of studying **${majorStr}**. Here's what I found.`;

  return {
    role: "assistant",
    content: intro,
    collegesMentioned: targetColleges?.slice(0, 5),
  };
}

/**
 * Convert roadmap JSON into ordered chat messages.
 * Order: Greeting, Student summary, Strengths, Gaps, Strategy, Projects, Extracurriculars, College Chances, Essay Ideas, Timeline, Final advice.
 */
export function roadmapToChatMessages(
  roadmap: RoadmapData,
  studentName: string,
  majors: string[],
  targetColleges: string[]
): ChatMessagePayload[] {
  const messages: ChatMessagePayload[] = [];

  // 1. Greeting
  messages.push(buildGreetingMessage(studentName, majors, targetColleges));

  // 2. Student summary
  const studentSummary = roadmap.studentSummary;
  if (studentSummary) {
    messages.push({
      role: "assistant",
      content: `**Summary of your profile**\n\n${studentSummary}`,
    });
  }

  // 3. Strengths
  const strengths = parseBulletList(roadmap.strengthsAnalysis);
  if (strengths.length) {
    messages.push({
      role: "assistant",
      content: `**Where you're strong**\n\nYou have a solid foundation in:\n\n${formatBullets(strengths)}`,
    });
  }

  // 4. Gaps
  const gaps = parseBulletList(roadmap.gapsAnalysis);
  if (gaps.length) {
    messages.push({
      role: "assistant",
      content: `**Areas to develop**\n\nHere's where I'd focus on building:\n\n${formatBullets(gaps)}`,
    });
  }

  // 5. Strategy
  const strategy = roadmap.strategySection;
  const strategySummary = strategy?.summary ?? strategy?.overview;
  if (strategySummary) {
    const prioritiesContent = strategy?.topPriorities?.length
      ? `\n\n**The biggest levers to pull:**\n\n${formatStrategyPriorities(strategy.topPriorities)}`
      : "";
    messages.push({
      role: "assistant",
      content: `**Strategy**\n\n${strategySummary}${prioritiesContent}`,
      section: "strategy",
    });
  }

  // 6. Projects
  const projects = roadmap.recommendedProjects;
  if (projects?.length) {
    const content = formatProjects(projects);
    messages.push({
      role: "assistant",
      content: `**Projects that would move the needle**\n\nThese are tailored to your majors and would show initiative and depth:\n\n${content}`,
      section: "projects",
    });
  }

  // 7. Extracurriculars
  const extracurriculars = roadmap.recommendedExtracurriculars;
  if (extracurriculars?.length) {
    const content = formatExtracurriculars(extracurriculars);
    messages.push({
      role: "assistant",
      content: `**Extracurriculars to consider**\n\nFocus on depth over breadth—these would strengthen your narrative:\n\n${content}`,
      section: "extracurriculars",
    });
  }

  // 8. College Chances
  const cc = roadmap.collegeCompetitiveness;
  const colleges = cc?.colleges;
  const topTargetNames = colleges?.map((c) => c.name) ?? targetColleges;
  if (colleges?.length) {
    const content = formatCollegeChances(colleges, topTargetNames);
    messages.push({
      role: "assistant",
      content,
      collegesMentioned: colleges.map((c) => c.name),
      section: "college",
    });
  }

  // 9. Essay Ideas
  const essayIdeas = roadmap.essayIdeasSection;
  if (essayIdeas?.length) {
    const content = formatEssayIdeas(essayIdeas);
    messages.push({
      role: "assistant",
      content: `**Essay themes that fit your story**\n\nBased on your profile, these are the strongest angles:\n\n${content}`,
      section: "essay",
    });
  }

  // 10. 12-month timeline
  const timeline = roadmap.timeline12Month ?? roadmap.timeline6Month ?? roadmap.timeline3Month;
  if (timeline?.length) {
    const content = formatTimeline(timeline);
    messages.push({
      role: "assistant",
      content: `**12‑month roadmap**\n\nHere's how I'd sequence things:\n\n${content}`,
    });
  }

  // 11. Final advice
  const finalAdvice = cc?.summary;
  if (finalAdvice) {
    messages.push({
      role: "assistant",
      content: `**Closing thoughts**\n\n${finalAdvice}`,
    });
  }

  return messages;
}

/** Suggested follow-up questions aligned with the roadmap sections */
export const SUGGESTED_QUESTIONS = [
  "What should my top priority be this semester?",
  "Which project should I start first?",
  "What extracurricular would help me most?",
  "How realistic is MIT for me?",
  "Which essay theme is strongest?",
];

/** Section tabs config: id, label, default question (college gets personalized) */
export const ROADMAP_SECTIONS: Array<{
  id: RoadmapSectionId;
  label: string;
  defaultQuestion: string;
}> = [
  { id: "strategy", label: "Strategy", defaultQuestion: "What should my top priority be this semester?" },
  { id: "projects", label: "Projects", defaultQuestion: "Which project should I start first?" },
  { id: "extracurriculars", label: "Extracurriculars", defaultQuestion: "What extracurricular would help me most?" },
  { id: "college", label: "College Chances", defaultQuestion: "How realistic is MIT for me?" },
  { id: "essay", label: "Essay Ideas", defaultQuestion: "Which essay theme is strongest?" },
];
