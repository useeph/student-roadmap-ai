/**
 * OpenAI client wrapper for roadmap generation.
 * Modular design: credentials from env; provider can be swapped later.
 */

import OpenAI from "openai";
import type { StudentProfileInput } from "@/types";
import type { OpenAIRoadmapResponse } from "@/types/openai-roadmap";
import { buildRoadmapPrompt } from "./build-roadmap-prompt";
import { getMockRoadmap } from "./mock-roadmap";
import { validateOpenAIRoadmapResponse } from "./validate-roadmap";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

export function isOpenAIAvailable(): boolean {
  return Boolean(OPENAI_API_KEY?.trim());
}

function createClient(): OpenAI | null {
  if (!OPENAI_API_KEY?.trim()) return null;
  return new OpenAI({
    apiKey: OPENAI_API_KEY,
  });
}

/**
 * Extracts JSON from a response that might be wrapped in markdown code blocks.
 */
function extractJSON(text: string): string {
  const trimmed = text.trim();
  const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }
  return trimmed;
}

/**
 * Generate a roadmap using OpenAI.
 * Falls back to deterministic mock data if no API key or on error.
 */
export async function generateRoadmapWithOpenAI(
  profile: StudentProfileInput
): Promise<{
  roadmap: OpenAIRoadmapResponse;
  source: "openai" | "mock";
  demoMode?: boolean;
}> {
  const client = createClient();

  if (!client || !isOpenAIAvailable()) {
    return {
      roadmap: getMockRoadmap(profile),
      source: "mock",
      demoMode: true,
    };
  }

  try {
    const { system, user } = buildRoadmapPrompt(profile);

    const completion = await client.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.6,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Empty response from OpenAI");
    }

    const jsonStr = extractJSON(content);
    const parsed = JSON.parse(jsonStr) as unknown;

    const validated = validateOpenAIRoadmapResponse(parsed);
    if (validated) {
      return {
        roadmap: validated,
        source: "openai",
      };
    }

    // Validation failed - return mock as fallback
    return {
      roadmap: getMockRoadmap(profile),
      source: "mock",
      demoMode: false,
    };
  } catch (error) {
    console.error("OpenAI roadmap generation error:", error);
    return {
      roadmap: getMockRoadmap(profile),
      source: "mock",
      demoMode: false,
    };
  }
}
