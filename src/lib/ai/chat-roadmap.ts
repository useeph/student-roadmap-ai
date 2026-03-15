/**
 * Converts roadmap JSON into conversational chat messages.
 * Used to transform structured roadmap data into a chat-like experience.
 */

import type {
  RoadmapOutput,
  CollegeEstimate,
  TopAction,
  TimelineItem,
  Recommendation,
} from "@/types";

export interface ChatMessagePayload {
  role: "user" | "assistant";
  content: string;
  /** Optional: colleges mentioned for logo display */
  collegesMentioned?: string[];
}

/** Roadmap data from API/DB - all fields optional */
export interface RoadmapData {
  studentSummary?: string;
  strengthsAnalysis?: string;
  gapsAnalysis?: string;
  recommendedExtracurriculars?: Recommendation[];
  recommendedProjects?: Recommendation[];
  courseworkSuggestions?: Recommendation[];
  competitions?: Recommendation[];
  internshipsPrograms?: Recommendation[];
  timeline3Month?: TimelineItem[];
  timeline6Month?: TimelineItem[];
  timeline12Month?: TimelineItem[];
  collegeCompetitiveness?: { colleges: CollegeEstimate[]; summary?: string };
  topActions?: TopAction[];
}

function formatList(items: string[]): string {
  if (!items.length) return "";
  return items.map((item) => `• ${item}`).join("\n");
}

function formatRecommendations(items: Recommendation[] | undefined): string {
  if (!items?.length) return "";
  return items.map((r) => `• **${r.name}**${r.reason ? ` — ${r.reason}` : ""}`).join("\n");
}

function formatTopActions(items: TopAction[] | undefined): string {
  if (!items?.length) return "";
  return items
    .slice(0, 5)
    .map((a) => `• **${a.action}** — ${a.impact}${a.timeframe ? ` (${a.timeframe})` : ""}`)
    .join("\n");
}

function formatTimeline(items: TimelineItem[] | undefined): string {
  if (!items?.length) return "";
  return items
    .map((t) => {
      const actions = Array.isArray(t.actions) ? t.actions.map((a) => `  - ${a}`).join("\n") : "";
      return `**${t.month || t.focus}**\n${actions}`;
    })
    .join("\n\n");
}

function formatCompetitiveness(colleges: CollegeEstimate[] | undefined, summary?: string): string {
  if (!colleges?.length) return summary ?? "";
  const tierLabels: Record<string, string> = {
    reach: "Reach",
    stretch: "Stretch",
    target: "Target",
    safety: "Safety",
  };
  const lines = colleges.map(
    (c) => `• **${c.name}** — ${tierLabels[c.tier] ?? c.tier}${c.notes ? `: ${c.notes}` : ""}`
  );
  const block = lines.join("\n");
  return summary ? `${summary}\n\n${block}` : block;
}

/**
 * Parse strengths/gaps that may be stored as space-joined string or bullet-separated.
 */
function parseBulletList(text: string | undefined): string[] {
  if (!text?.trim()) return [];
  // Handle "• item1 • item2" or "item1. item2." or "item1, item2"
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

/**
 * Build the initial greeting message.
 */
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
      ? `Hi ${studentName}! I analyzed your profile and your goal of studying ${majorStr} at universities like ${collegeStr}. Here's what I found.`
      : `Hi ${studentName}! I analyzed your profile and your goal of studying ${majorStr}. Here's what I found.`;

  return {
    role: "assistant",
    content: intro,
    collegesMentioned: targetColleges?.slice(0, 5),
  };
}

/**
 * Convert roadmap JSON into ordered chat message payloads.
 * Each message is one "section" of the roadmap for sequential display.
 */
export function roadmapToChatMessages(
  roadmap: RoadmapData,
  studentName: string,
  majors: string[],
  targetColleges: string[]
): ChatMessagePayload[] {
  const messages: ChatMessagePayload[] = [];

  messages.push(buildGreetingMessage(studentName, majors, targetColleges));

  // 1. Student summary
  if (roadmap.studentSummary) {
    messages.push({
      role: "assistant",
      content: `**Student Summary**\n\n${roadmap.studentSummary}`,
    });
  }

  // 2. Strengths
  const strengths = parseBulletList(roadmap.strengthsAnalysis);
  if (strengths.length) {
    const content = `**Here are your biggest strengths:**\n\n${formatList(strengths)}`;
    messages.push({ role: "assistant", content });
  } else if (roadmap.strengthsAnalysis) {
    messages.push({
      role: "assistant",
      content: `**Strengths**\n\n${roadmap.strengthsAnalysis}`,
    });
  }

  // 3. Gaps
  const gaps = parseBulletList(roadmap.gapsAnalysis);
  if (gaps.length) {
    const content = `**Areas to develop:**\n\n${formatList(gaps)}`;
    messages.push({ role: "assistant", content });
  } else if (roadmap.gapsAnalysis) {
    messages.push({
      role: "assistant",
      content: `**Gaps**\n\n${roadmap.gapsAnalysis}`,
    });
  }

  // 4. Top recommended actions
  const topActionsContent = formatTopActions(roadmap.topActions);
  if (topActionsContent) {
    messages.push({
      role: "assistant",
      content: `**Top recommended actions**\n\n${topActionsContent}`,
    });
  }

  // 5. Competitiveness
  const cc = roadmap.collegeCompetitiveness;
  if (cc?.colleges?.length) {
    const content = formatCompetitiveness(cc.colleges, cc.summary);
    messages.push({
      role: "assistant",
      content: `**Competitiveness for your target colleges**\n\n${content}`,
      collegesMentioned: cc.colleges.map((c) => c.name),
    });
  }

  // 6. 12-month roadmap
  const timeline = roadmap.timeline12Month ?? roadmap.timeline6Month ?? roadmap.timeline3Month;
  if (timeline?.length) {
    const content = formatTimeline(timeline);
    messages.push({
      role: "assistant",
      content: `**12‑month roadmap**\n\n${content}`,
    });
  }

  return messages;
}

/** Suggested follow-up questions to show as chips */
export const SUGGESTED_QUESTIONS = [
  "How can I improve my chances at MIT?",
  "What AI project should I build?",
  "What competitions should I try?",
  "How realistic is Stanford for me?",
];
