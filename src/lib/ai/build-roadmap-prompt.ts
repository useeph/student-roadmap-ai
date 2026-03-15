/**
 * Prompt builder for OpenAI roadmap generation.
 * Converts student profile into system + user prompts.
 */

import type { StudentProfileInput } from "@/types";

const SYSTEM_PROMPT = `You are an expert college admissions strategist and academic planning assistant.

Your role:
- Provide realistic, constructive guidance for middle school and high school students
- Help students understand their profile strengths and gaps
- Recommend practical next actions aligned with their goals and constraints
- Use probability bands and ranges—never guarantee admission to any school
- Use encouraging, supportive language
- Be specific and actionable
- Consider the student's available time per week when recommending activities

Critical rules:
- NEVER guarantee admission to any college, program, internship, or competition
- NEVER use certainties—always use phrases like "may improve," "could strengthen," "often valued by"
- Give probability bands (e.g., 10-25%) rather than point estimates when discussing competitiveness
- If a student has limited hours, prioritize fewer, higher-impact activities
- All outputs must be valid JSON only—no markdown, no explanations outside the JSON structure
- Return exactly the schema requested: no extra fields, no truncated arrays

Output format:
Return ONLY a valid JSON object matching this exact schema. No other text.

{
  "studentSummary": "2-4 sentence summary of the student's profile and trajectory",
  "strengths": ["string", "string", ...],
  "gaps": ["string", "string", ...],
  "extracurricularRecommendations": [
    {
      "title": "string",
      "reason": "string",
      "priority": "High" | "Medium" | "Low"
    }
  ],
  "projectIdeas": [
    {
      "title": "string",
      "description": "string",
      "timeEstimate": "string",
      "difficulty": "Beginner" | "Intermediate" | "Advanced"
    }
  ],
  "courseworkSuggestions": ["string", ...],
  "competitionSuggestions": ["string", ...],
  "timeline": [
    {
      "period": "string (e.g. Next 3 months)",
      "actions": ["string", ...]
    }
  ],
  "competitivenessEstimates": [
    {
      "collegeName": "string",
      "intendedMajor": "string",
      "classification": "Extreme Reach" | "Reach" | "Target" | "Likely" | "Safety",
      "probabilityBandLow": number (0-100),
      "probabilityBandHigh": number (0-100),
      "explanation": "string"
    }
  ],
  "improvementActions": [
    {
      "collegeName": "string",
      "actions": [
        {
          "actionTitle": "string",
          "impactScore": number (1-10),
          "feasibilityScore": number (1-10),
          "timeHorizon": "string (e.g. 3-6 months)",
          "explanation": "string"
        }
      ]
    }
  ],
  "finalAdvice": "2-4 sentences of encouraging, actionable closing advice"
}`;

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

  const userParts: string[] = [
    `Analyze this student profile and generate a structured admissions roadmap.`,
    ``,
    `**Student:** ${name}`,
    gradeLevel ? `**Grade:** ${gradeLevel}` : "",
    age ? `**Age:** ${age}` : "",
    graduationYear ? `**Graduation year:** ${graduationYear}` : "",
    gpa !== undefined && gpa !== null ? `**GPA:** ${gpa}` : "",
    currentClasses.length ? `**Current classes:** ${currentClasses.join(", ")}` : "",
    intendedMajors.length ? `**Intended majors:** ${intendedMajors.join(", ")}` : "",
    intendedIndustry ? `**Intended industry:** ${intendedIndustry}` : "",
    targetColleges.length ? `**Target colleges:** ${targetColleges.join(", ")}` : "",
    interests.length ? `**Interests:** ${interests.join(", ")}` : "",
    extracurriculars.length ? `**Extracurriculars:** ${extracurriculars.join(", ")}` : "",
    awards.length ? `**Awards:** ${awards.join(", ")}` : "",
    leadershipExp.length ? `**Leadership experience:** ${leadershipExp.join(", ")}` : "",
    githubUrl ? `**GitHub:** ${githubUrl}` : "",
    portfolioUrl ? `**Portfolio:** ${portfolioUrl}` : "",
    hoursPerWeek !== undefined && hoursPerWeek !== null
      ? `**Available hours per week:** ${hoursPerWeek}`
      : "",
    constraints ? `**Constraints:** ${constraints}` : "",
    goals ? `**Goals:** ${goals}` : "",
    testScores.sat ? `**SAT:** ${testScores.sat}` : "",
    testScores.act ? `**ACT:** ${testScores.act}` : "",
    testScores.apScores?.length
      ? `**AP scores:** ${testScores.apScores.join(", ")}`
      : "",
  ];

  const userPrompt = userParts.filter(Boolean).join("\n");

  return {
    system: SYSTEM_PROMPT,
    user: userPrompt,
  };
}
