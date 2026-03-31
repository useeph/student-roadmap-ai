/**
 * Structured roadmap response schema.
 * Strong, consistent format across the pipeline.
 */

export type PriorityLevel = "High" | "Medium" | "Low";
export type ImpactLevel = "High" | "Medium" | "Low";
export type DifficultyLevel = "Beginner" | "Intermediate" | "Advanced";
export type CompetitivenessClassification =
  | "Extreme Reach"
  | "Reach"
  | "Target"
  | "Likely"
  | "Safety";

/** Strategy top priority item */
export interface StrategyTopPriority {
  title: string;
  reason: string;
  impact: ImpactLevel;
}

/** Strategy section */
export interface StrategySection {
  summary: string;
  topPriorities: StrategyTopPriority[];
}

/** Project idea */
export interface ProjectIdea {
  title: string;
  description: string;
  technologies: string[];
  timeEstimate: string;
  difficulty: DifficultyLevel;
  whyItStandsOut: string;
}

/** Extracurricular recommendation */
export interface ExtracurricularRecommendation {
  title: string;
  reason: string;
  howToStandOut: string;
  priority: PriorityLevel;
}

/** College competitiveness estimate */
export interface CompetitivenessEstimate {
  collegeName: string;
  intendedMajor: string;
  classification: CompetitivenessClassification;
  probabilityBandLow: number;
  probabilityBandHigh: number;
  explanation: string;
  biggestImprovementNeeded: string;
}

/** Essay idea */
export interface EssayIdea {
  theme: string;
  storyOutline: string;
  whatItReveals: string;
  whyItIsCompelling: string;
}

export interface TimelinePeriod {
  period: string;
  actions: string[];
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

/** Canonical roadmap response */
export interface OpenAIRoadmapResponse {
  studentSummary: string;
  strengths: string[];
  gaps: string[];
  strategy: StrategySection;
  projects: ProjectIdea[];
  extracurriculars: ExtracurricularRecommendation[];
  collegeChances: CompetitivenessEstimate[];
  essayIdeas: EssayIdea[];
  timeline: TimelinePeriod[];
  improvementActions: ImprovementAction[];
  finalAdvice: string;
}
