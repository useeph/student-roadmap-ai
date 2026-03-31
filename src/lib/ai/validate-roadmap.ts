/**
 * Server-side validation of OpenAI roadmap response.
 * Validates the structured schema and normalizes to OpenAIRoadmapResponse.
 */

import { z } from "zod";
import type { OpenAIRoadmapResponse } from "@/types/openai-roadmap";

const strategyTopPrioritySchema = z.object({
  title: z.string(),
  reason: z.string(),
  impact: z.enum(["High", "Medium", "Low"]),
});

const strategySchema = z.object({
  summary: z.string(),
  topPriorities: z.array(strategyTopPrioritySchema),
});

const projectSchema = z.object({
  title: z.string(),
  description: z.string(),
  technologies: z.array(z.string()),
  timeEstimate: z.string(),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
  whyItStandsOut: z.string(),
});

const extracurricularSchema = z.object({
  title: z.string(),
  reason: z.string(),
  howToStandOut: z.string(),
  priority: z.enum(["High", "Medium", "Low"]),
});

const competitivenessSchema = z.object({
  collegeName: z.string(),
  intendedMajor: z.string(),
  classification: z.enum(["Extreme Reach", "Reach", "Target", "Likely", "Safety"]),
  probabilityBandLow: z.number().min(0).max(100),
  probabilityBandHigh: z.number().min(0).max(100),
  explanation: z.string(),
  biggestImprovementNeeded: z.string(),
});

const essayIdeaSchema = z.object({
  theme: z.string(),
  storyOutline: z.string(),
  whatItReveals: z.string(),
  whyItIsCompelling: z.string(),
});

const timelinePeriodSchema = z.object({
  period: z.string(),
  actions: z.array(z.string()),
});

const improvementActionItemSchema = z.object({
  actionTitle: z.string(),
  impactScore: z.number().min(1).max(10),
  feasibilityScore: z.number().min(1).max(10),
  timeHorizon: z.string(),
  explanation: z.string(),
});

const improvementActionSchema = z.object({
  collegeName: z.string(),
  actions: z.array(improvementActionItemSchema),
});

const roadmapSchema = z.object({
  studentSummary: z.string(),
  strengths: z.array(z.string()),
  gaps: z.array(z.string()),
  strategy: strategySchema,
  projects: z.array(projectSchema),
  extracurriculars: z.array(extracurricularSchema),
  collegeChances: z.array(competitivenessSchema),
  essayIdeas: z.array(essayIdeaSchema),
  timeline: z.array(timelinePeriodSchema),
  improvementActions: z.array(improvementActionSchema),
  finalAdvice: z.string(),
});

export function validateOpenAIRoadmapResponse(
  parsed: unknown
): OpenAIRoadmapResponse | null {
  const result = roadmapSchema.safeParse(parsed);
  if (result.success) {
    return result.data as OpenAIRoadmapResponse;
  }
  console.warn("OpenAI roadmap validation failed:", result.error.issues);
  return null;
}
