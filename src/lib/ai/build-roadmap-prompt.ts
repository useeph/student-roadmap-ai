/**
 * Prompt builder for OpenAI roadmap generation.
 * Production-style prompt: elite admissions strategist persona.
 */

import type { StudentProfileInput } from "@/types";

const SYSTEM_PROMPT = `You are an elite college admissions strategist with 15+ years advising students for top universities. Your advice is realistic, specific, and constructive. You do not sugarcoat; you do not guarantee outcomes.

## Core principles
- NEVER guarantee admission to any college, program, or opportunity. Always use probability bands (e.g., 15–30%) and hedged language ("may strengthen," "often valued," "could differentiate").
- AVOID generic advice. Every recommendation must be tailored to this specific student's GPA, course rigor, extracurricular depth, leadership, awards, intended majors, target colleges, and time constraints.
- PRIORITIZE highest-impact actions. If a student has limited hours per week, recommend fewer, better activities—depth over breadth.
- NO repeated recommendations. Each item must be distinct. In improvementActions, do not duplicate the same action across multiple colleges unless it is truly college-specific and justified.
- DEPTH over breadth. One leadership role and one substantive project beat ten shallow involvements.

## Output format
Return ONLY valid JSON. No markdown code blocks. No explanations outside the JSON. No extra text before or after. The response must parse as JSON directly.

## JSON schema (exact structure)
{
  "studentSummary": "string",
  "strengths": ["string"],
  "gaps": ["string"],
  "strategy": {
    "summary": "string",
    "topPriorities": [
      {
        "title": "string",
        "reason": "string",
        "impact": "High" | "Medium" | "Low"
      }
    ]
  },
  "projects": [
    {
      "title": "string",
      "description": "string",
      "technologies": ["string"],
      "timeEstimate": "string",
      "difficulty": "Beginner" | "Intermediate" | "Advanced",
      "whyItStandsOut": "string"
    }
  ],
  "extracurriculars": [
    {
      "title": "string",
      "reason": "string",
      "howToStandOut": "string",
      "priority": "High" | "Medium" | "Low"
    }
  ],
  "collegeChances": [
    {
      "collegeName": "string",
      "intendedMajor": "string",
      "classification": "Extreme Reach" | "Reach" | "Target" | "Likely" | "Safety",
      "probabilityBandLow": 0,
      "probabilityBandHigh": 0,
      "explanation": "string",
      "biggestImprovementNeeded": "string"
    }
  ],
  "essayIdeas": [
    {
      "theme": "string",
      "storyOutline": "string",
      "whatItReveals": "string",
      "whyItIsCompelling": "string"
    }
  ],
  "timeline": [
    {
      "period": "string",
      "actions": ["string"]
    }
  ],
  "improvementActions": [
    {
      "collegeName": "string",
      "actions": [
        {
          "actionTitle": "string",
          "impactScore": 8,
          "feasibilityScore": 6,
          "timeHorizon": "string",
          "explanation": "string"
        }
      ]
    }
  ],
  "finalAdvice": "string"
}

## Section guidelines
- strategy.summary: 2–4 sentences on current position and recommended approach. topPriorities: 3–5 items, each with title, reason, and impact (High/Medium/Low).
- projects: 2–4 ideas. Include technologies (e.g., Python, React). whyItStandsOut: why this project fits this student specifically.
- extracurriculars: 2–4 recommendations. howToStandOut: how to differentiate (leadership, depth, unique angle).
- collegeChances: For each target college. biggestImprovementNeeded: one concrete area to strengthen for that school.
- essayIdeas: 3 themes. storyOutline: narrative arc. whatItReveals: character/traits shown. whyItIsCompelling: admissions appeal.`;

function formatSection(title: string, items: string[]): string {
  if (items.length === 0) return "";
  return `## ${title}\n${items.join("\n")}`;
}

export function buildRoadmapPrompt(profile: StudentProfileInput): {
  system: string;
  user: string;
} {
  const name = profile.name ?? "Student";
  const age = profile.age;
  const gradeLevel = profile.gradeLevel ?? "Unknown";
  const graduationYear = profile.graduationYear;
  const gpa = profile.gpa;
  const currentClasses = profile.currentClasses ?? [];
  const intendedMajors = profile.intendedMajors ?? [];
  const intendedIndustry = profile.intendedIndustry ?? "";
  const targetColleges = profile.targetColleges ?? [];
  const interests = profile.interests ?? [];
  const extracurriculars = profile.extracurriculars ?? [];
  const awards = profile.awards ?? [];
  const leadershipExp = profile.leadershipExp ?? [];
  const githubUrl = profile.githubUrl;
  const portfolioUrl = profile.portfolioUrl;
  const hoursPerWeek = profile.hoursPerWeek;
  const constraints = profile.constraints ?? "";
  const goals = profile.goals ?? "";
  const testScores = profile.testScores ?? {};

  const sections: string[] = [];

  const overview: string[] = [
    `**Name:** ${name}`,
    `**Grade:** ${gradeLevel}`,
    age !== undefined && age !== null ? `**Age:** ${age}` : "",
    graduationYear ? `**Graduation year:** ${graduationYear}` : "",
  ].filter(Boolean);
  sections.push(formatSection("Profile", overview));

  const academics: string[] = [
    gpa !== undefined && gpa !== null ? `**GPA:** ${gpa}` : "",
    currentClasses.length ? `**Current classes:** ${currentClasses.join(", ")}` : "",
    intendedMajors.length ? `**Intended majors:** ${intendedMajors.join(", ")}` : "",
    intendedIndustry ? `**Intended industry:** ${intendedIndustry}` : "",
    testScores.sat ? `**SAT:** ${testScores.sat}` : "",
    testScores.act ? `**ACT:** ${testScores.act}` : "",
    testScores.apScores?.length ? `**AP scores:** ${testScores.apScores.join(", ")}` : "",
  ].filter(Boolean);
  if (academics.length) sections.push(formatSection("Academics", academics));

  const activities: string[] = [
    extracurriculars.length ? `**Extracurriculars:** ${extracurriculars.join(", ")}` : "",
    leadershipExp.length ? `**Leadership:** ${leadershipExp.join(", ")}` : "",
    awards.length ? `**Awards:** ${awards.join(", ")}` : "",
    interests.length ? `**Interests:** ${interests.join(", ")}` : "",
  ].filter(Boolean);
  if (activities.length) sections.push(formatSection("Activities & Recognition", activities));

  const targets: string[] = [
    targetColleges.length ? `**Target colleges:** ${targetColleges.join(", ")}` : "",
    goals ? `**Goals:** ${goals}` : "",
    hoursPerWeek !== undefined && hoursPerWeek !== null
      ? `**Hours per week (available):** ${hoursPerWeek}`
      : "",
    constraints ? `**Constraints:** ${constraints}` : "",
    githubUrl ? `**GitHub:** ${githubUrl}` : "",
    portfolioUrl ? `**Portfolio:** ${portfolioUrl}` : "",
  ].filter(Boolean);
  if (targets.length) sections.push(formatSection("Targets & Constraints", targets));

  const userPrompt = [
    "Generate a structured admissions roadmap for this student. Tailor every recommendation to their profile. Return only valid JSON matching the schema.",
    "",
    sections.join("\n\n"),
  ].join("\n");

  return {
    system: SYSTEM_PROMPT,
    user: userPrompt,
  };
}
