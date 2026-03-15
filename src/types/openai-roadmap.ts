/**
 * Strict TypeScript types for OpenAI roadmap response.
 * Matches the JSON schema requested from the model.
 */

export type PriorityLevel = "High" | "Medium" | "Low";
export type DifficultyLevel = "Beginner" | "Intermediate" | "Advanced";
export type CompetitivenessClassification =
  | "Extreme Reach"
  | "Reach"
  | "Target"
  | "Likely"
  | "Safety";

export interface ExtracurricularRecommendation {
  title: string;
  reason: string;
  priority: PriorityLevel;
}

export interface ProjectIdea {
  title: string;
  description: string;
  timeEstimate: string;
  difficulty: DifficultyLevel;
}

export interface TimelinePeriod {
  period: string;
  actions: string[];
}

export interface CompetitivenessEstimate {
  collegeName: string;
  intendedMajor: string;
  classification: CompetitivenessClassification;
  probabilityBandLow: number;
  probabilityBandHigh: number;
  explanation: string;
}

export interface ImprovementActionItem {
  actionTitle: string;
  impactScore: number;
  feasibilityScore: number;
  timeHorizon: string;
  explanation: string;
}

export interface ImprovementAction {
  collegeName: string;
  actions: ImprovementActionItem[];
}

export interface OpenAIRoadmapResponse {
  studentSummary: string;
  strengths: string[];
  gaps: string[];
  extracurricularRecommendations: ExtracurricularRecommendation[];
  projectIdeas: ProjectIdea[];
  courseworkSuggestions: string[];
  competitionSuggestions: string[];
  timeline: TimelinePeriod[];
  competitivenessEstimates: CompetitivenessEstimate[];
  improvementActions: ImprovementAction[];
  finalAdvice: string;
}
