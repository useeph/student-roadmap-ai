export interface StudentProfileInput {
  name: string;
  age?: number;
  gradeLevel?: string;
  graduationYear?: number;
  gpa?: number;
  currentClasses?: string[];
  intendedMajors?: string[];
  intendedIndustry?: string;
  targetColleges?: string[];
  interests?: string[];
  extracurriculars?: string[];
  awards?: string[];
  leadershipExp?: string[];
  githubUrl?: string;
  portfolioUrl?: string;
  hoursPerWeek?: number;
  constraints?: string;
  goals?: string;
  testScores?: {
    sat?: number;
    act?: number;
    apScores?: number[];
  };
}

export interface TimelineItem {
  month: string;
  actions: string[];
  focus: string;
}

export interface Recommendation {
  name: string;
  reason: string;
  priority: "high" | "medium" | "low";
  category?: string;
}

export interface CollegeEstimate {
  name: string;
  tier: "reach" | "target" | "safety" | "stretch";
  notes?: string;
  improvementAreas?: string[];
}

export interface TopAction {
  action: string;
  impact: string;
  priority: number;
  timeframe?: string;
}

export interface Citation {
  title: string;
  source: string;
  url?: string;
  excerpt?: string;
  year?: number;
}

export interface RoadmapOutput {
  studentSummary: string;
  strengthsAnalysis: string;
  gapsAnalysis: string;
  recommendedExtracurriculars: Recommendation[];
  recommendedProjects: Recommendation[];
  courseworkSuggestions: Recommendation[];
  competitions: Recommendation[];
  internshipsPrograms: Recommendation[];
  timeline3Month: TimelineItem[];
  timeline6Month: TimelineItem[];
  timeline12Month: TimelineItem[];
  collegeCompetitiveness: {
    colleges: CollegeEstimate[];
    summary: string;
  };
  topActions: TopAction[];
  citations: Citation[];
  admissionsStrategyOptimizer?: AdmissionsStrategyResult[];
}

// Admissions Strategy Optimizer
export interface AdmissionsStrategyAction {
  action: string;
  impactScore: number;
  feasibilityScore: number;
  timeline: string;
  reason: string;
}

export interface AdmissionsStrategyResult {
  college: string;
  major: string;
  recommendations: AdmissionsStrategyAction[];
}
