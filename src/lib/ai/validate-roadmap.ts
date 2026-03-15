/**
 * Server-side validation of OpenAI roadmap response.
 * Ensures parsed JSON matches expected schema before use.
 */

import { z } from "zod";
import type { OpenAIRoadmapResponse } from "@/types/openai-roadmap";

const extracurricularSchema = z.object({
  title: z.string(),
  reason: z.string(),
  priority: z.enum(["High", "Medium", "Low"]),
});

const projectIdeaSchema = z.object({
  title: z.string(),
  description: z.string(),
  timeEstimate: z.string(),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
});

const timelinePeriodSchema = z.object({
  period: z.string(),
  actions: z.array(z.string()),
});

const competitivenessSchema = z.object({
  collegeName: z.string(),
  intendedMajor: z.string(),
  classification: z.enum(["Extreme Reach", "Reach", "Target", "Likely", "Safety"]),
  probabilityBandLow: z.number().min(0).max(100),
  probabilityBandHigh: z.number().min(0).max(100),
  explanation: z.string(),
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

const openAIRoadmapSchema = z.object({
  studentSummary: z.string(),
  strengths: z.array(z.string()),
  gaps: z.array(z.string()),
  extracurricularRecommendations: z.array(extracurricularSchema),
  projectIdeas: z.array(projectIdeaSchema),
  courseworkSuggestions: z.array(z.string()),
  competitionSuggestions: z.array(z.string()),
  timeline: z.array(timelinePeriodSchema),
  competitivenessEstimates: z.array(competitivenessSchema),
  improvementActions: z.array(improvementActionSchema),
  finalAdvice: z.string(),
});

export function validateOpenAIRoadmapResponse(
  parsed: unknown
): OpenAIRoadmapResponse | null {
  const result = openAIRoadmapSchema.safeParse(parsed);
  if (result.success) {
    return result.data as OpenAIRoadmapResponse;
  }
  console.warn("OpenAI roadmap validation failed:", result.error.issues);
  return null;
}
