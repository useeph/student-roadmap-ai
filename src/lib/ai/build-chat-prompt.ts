/**
 * Follow-up chat prompt builder.
 * Grounds responses in the student profile, generated roadmap, and conversation history.
 */

import type { StudentProfileInput } from "@/types";

// DB roadmap shape - flexible for JSON fields
interface RoadmapContext {
  studentSummary?: string | null;
  strengthsAnalysis?: string | null;
  gapsAnalysis?: string | null;
  recommendedExtracurriculars?: unknown;
  recommendedProjects?: unknown;
  collegeCompetitiveness?: unknown;
  strategySection?: unknown;
  essayIdeasSection?: unknown;
  timeline12Month?: unknown;
  timeline6Month?: unknown;
  timeline3Month?: unknown;
  topActions?: unknown;
}

interface ChatContext {
  profile: StudentProfileInput;
  roadmap: RoadmapContext | null;
  recentMessages: Array<{ role: string; content: string }>;
  currentQuestion: string;
}

const SYSTEM_PERSONA = `You are the same elite admissions strategist who just delivered this student's roadmap. You speak in first person, with the same voice: direct, realistic, constructive, never sugarcoating.

## Core rules
- REFERENCE the student's actual data: GPA, classes, interests, target colleges, major, extracurriculars, awards, constraints. Never speak in abstractions.
- BUILD on recommendations already in the roadmap. Don't rehash what they've seen—extend, prioritize, or explain tradeoffs.
- BE CONCRETE: specific project ideas, specific next steps, specific essay angles. No "you should work hard" or "focus on your grades."
- KEEP answers concise (2–5 paragraphs max). Bullet points when listing options.
- NEVER guarantee admission, scholarships, or outcomes. Use probability language ("may strengthen," "could help," "often valued").
- AVOID repetitive phrasing. Vary sentence structure. Don't repeat what you said in the previous message unless the user asks for clarification.
- If the user asks something similar to a prior question, briefly acknowledge what you said before, then add one new angle, tradeoff, or concrete next step—don't rehash the full answer.`;

const SECTION_GUIDANCE = `## Section-specific response style
- **Strategy questions** (priorities, tradeoffs, what to focus on): Frame as tradeoffs. "Given your [X constraint], here's how I'd prioritize..." Name the biggest levers and why.
- **Project questions** (which to start, ideas): Give specific project ideas tied to their major/interests. Explain why each would stand out for their profile. Mention technologies or approaches.
- **Extracurricular questions**: Suggest concrete next steps—how to deepen an activity, which clubs/competitions fit, how to stand out in their niche.
- **College chances** (how realistic, what helps): Reference their GPA, rigor, ECs. Explain what would move the needle for that school. Don't guarantee; use probability bands.
- **Essay questions** (themes, angles): Tie themes to their actual story—interests, experiences, gaps. Make suggestions specific to their profile, not generic essay advice.`;

function formatProfile(profile: StudentProfileInput): string {
  const parts: string[] = [
    `**Name:** ${profile.name}`,
    profile.gradeLevel ? `**Grade:** ${profile.gradeLevel}` : "",
    profile.graduationYear ? `**Graduation:** ${profile.graduationYear}` : "",
    profile.gpa !== undefined && profile.gpa !== null ? `**GPA:** ${profile.gpa}` : "",
    profile.currentClasses?.length
      ? `**Current classes:** ${profile.currentClasses.join(", ")}`
      : "",
    profile.intendedMajors?.length
      ? `**Intended majors:** ${profile.intendedMajors.join(", ")}`
      : "",
    profile.intendedIndustry ? `**Industry interest:** ${profile.intendedIndustry}` : "",
    profile.targetColleges?.length
      ? `**Target colleges:** ${profile.targetColleges.join(", ")}`
      : "",
    profile.interests?.length ? `**Interests:** ${profile.interests.join(", ")}` : "",
    profile.extracurriculars?.length
      ? `**Current extracurriculars:** ${profile.extracurriculars.join(", ")}`
      : "",
    profile.awards?.length ? `**Awards:** ${profile.awards.join(", ")}` : "",
    profile.leadershipExp?.length
      ? `**Leadership:** ${profile.leadershipExp.join(", ")}`
      : "",
    profile.hoursPerWeek !== undefined && profile.hoursPerWeek !== null
      ? `**Hours/week (available):** ${profile.hoursPerWeek}`
      : "",
    profile.constraints ? `**Constraints:** ${profile.constraints}` : "",
    profile.goals ? `**Goals:** ${profile.goals}` : "",
    profile.githubUrl ? `**GitHub:** ${profile.githubUrl}` : "",
    profile.portfolioUrl ? `**Portfolio:** ${profile.portfolioUrl}` : "",
  ];
  if (profile.testScores) {
    const ts = profile.testScores;
    if (ts.sat) parts.push(`**SAT:** ${ts.sat}`);
    if (ts.act) parts.push(`**ACT:** ${ts.act}`);
    if (ts.apScores?.length) parts.push(`**AP scores:** ${ts.apScores.join(", ")}`);
  }
  return parts.filter(Boolean).join("\n");
}

function formatRoadmap(roadmap: RoadmapContext): string {
  const blocks: string[] = [];

  if (roadmap.studentSummary) {
    blocks.push(`**Summary:** ${roadmap.studentSummary}`);
  }
  if (roadmap.strengthsAnalysis) {
    blocks.push(`**Strengths:** ${roadmap.strengthsAnalysis}`);
  }
  if (roadmap.gapsAnalysis) {
    blocks.push(`**Gaps to address:** ${roadmap.gapsAnalysis}`);
  }

  const strategy = roadmap.strategySection as { summary?: string; overview?: string; topPriorities?: unknown[] } | undefined;
  if (strategy) {
    const summary = strategy.summary ?? strategy.overview ?? "";
    if (summary) blocks.push(`**Strategy:** ${summary}`);
    const priorities = strategy.topPriorities;
    if (Array.isArray(priorities) && priorities.length) {
      const lines = priorities.map((p) => {
        if (typeof p === "string") return `  - ${p}`;
        const obj = p as { title?: string; reason?: string };
        return `  - ${obj.title ?? ""}${obj.reason ? ` — ${obj.reason}` : ""}`;
      });
      blocks.push(`**Top priorities:**\n${lines.join("\n")}`);
    }
  }

  const projects = roadmap.recommendedProjects as Array<{ name?: string; title?: string; reason?: string; description?: string; whyItStandsOut?: string }> | undefined;
  if (Array.isArray(projects) && projects.length) {
    const lines = projects.map((p) => {
      const title = p.name ?? p.title ?? "Project";
      const desc = p.reason ?? p.description ?? p.whyItStandsOut ?? "";
      return `  - **${title}**${desc ? ` — ${desc}` : ""}`;
    });
    blocks.push(`**Recommended projects:**\n${lines.join("\n")}`);
  }

  const extracurr = roadmap.recommendedExtracurriculars as Array<{ name?: string; title?: string; reason?: string; howToStandOut?: string }> | undefined;
  if (Array.isArray(extracurr) && extracurr.length) {
    const lines = extracurr.map((e) => {
      const title = e.name ?? e.title ?? "Activity";
      const extra = e.howToStandOut ? ` (Stand out: ${e.howToStandOut})` : "";
      return `  - **${title}** — ${e.reason ?? ""}${extra}`;
    });
    blocks.push(`**Recommended extracurriculars:**\n${lines.join("\n")}`);
  }

  const cc = roadmap.collegeCompetitiveness as { colleges?: Array<{ name?: string; tier?: string; notes?: string; biggestImprovementNeeded?: string }>; summary?: string } | undefined;
  if (cc?.colleges?.length) {
    const lines = cc.colleges.map((c) => `  - **${c.name ?? "?"}** — ${c.tier ?? ""}: ${c.notes ?? ""}${c.biggestImprovementNeeded ? ` — Improvement: ${c.biggestImprovementNeeded}` : ""}`);
    blocks.push(`**College chances:**\n${lines.join("\n")}`);
    if (cc.summary) blocks.push(`**Overall advice:** ${cc.summary}`);
  }

  const essays = roadmap.essayIdeasSection as Array<{ theme?: string; storyOutline?: string; description?: string; whatItReveals?: string; whyItIsCompelling?: string; whyCompelling?: string }> | undefined;
  if (Array.isArray(essays) && essays.length) {
    const lines = essays.map((e) => {
      const outline = e.storyOutline ?? e.description ?? "";
      const reveals = e.whatItReveals ? ` Reveals: ${e.whatItReveals}.` : "";
      const compelling = e.whyItIsCompelling ?? e.whyCompelling ?? "";
      return `  - **${e.theme ?? "Theme"}** — ${outline}${reveals} ${compelling}`;
    });
    blocks.push(`**Essay ideas:**\n${lines.join("\n")}`);
  }

  const timeline = (roadmap.timeline12Month ?? roadmap.timeline6Month ?? roadmap.timeline3Month) as Array<{ month?: string; focus?: string; actions?: string[] }> | undefined;
  if (Array.isArray(timeline) && timeline.length) {
    const lines = timeline.flatMap((t) => {
      const label = t.month ?? t.focus ?? "Period";
      const actions = Array.isArray(t.actions) ? t.actions.map((a) => `    - ${a}`).join("\n") : "";
      return [`  **${label}**`, actions].filter(Boolean);
    });
    blocks.push(`**Timeline:**\n${lines.join("\n")}`);
  }

  return blocks.join("\n\n");
}

/** Detect which section the question relates to (for optional focus hint) */
function inferSection(question: string): string | null {
  const q = question.toLowerCase();
  if (q.includes("priority") || q.includes("focus") || q.includes("strategy") || q.includes("lever") || q.includes("semester")) return "strategy";
  if (q.includes("project") || q.includes("build") || q.includes("start first")) return "projects";
  if (q.includes("extracurricular") || q.includes("activity") || q.includes("club") || q.includes("ec")) return "extracurriculars";
  if (q.includes("realistic") || q.includes("chance") || q.includes("mit") || q.includes("stanford") || q.includes("ivy")) return "college";
  if (q.includes("essay") || q.includes("theme") || q.includes("personal statement")) return "essay";
  return null;
}

/**
 * Build the system prompt for follow-up chat.
 */
export function buildChatSystemPrompt(context: ChatContext): string {
  const { profile, roadmap, recentMessages, currentQuestion } = context;

  const profileBlock = formatProfile(profile);
  const roadmapBlock = roadmap ? formatRoadmap(roadmap) : "(No roadmap generated yet—base answers on the profile only.)";
  const section = inferSection(currentQuestion);
  const sectionHint = section
    ? `\n\nThe user's question likely relates to: **${section}**. Use the ${section} section of the roadmap when answering.`
    : "";

  const recentCount = Math.min(recentMessages.length, 6);
  const recentBlock =
    recentCount > 0
      ? `\n\n## Recent conversation (last ${recentCount} exchanges)\nDo not repeat what you already said. Build on it or pivot to new angles.`
      : "";

  return `${SYSTEM_PERSONA}
${SECTION_GUIDANCE}

## Student profile
${profileBlock}

## Generated roadmap
${roadmapBlock}
${sectionHint}
${recentBlock}`;
}
