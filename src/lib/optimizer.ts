/**
 * Admissions Strategy Optimizer
 * Identifies highest-impact actions to improve admission chances for each target college.
 * Uses profile data to compare against typical expectations and surface missing signals.
 */

import type {
  AdmissionsStrategyAction,
  AdmissionsStrategyResult,
  StudentProfileInput,
} from "@/types";

const TOP_STEM_SCHOOLS = ["MIT", "Stanford", "Caltech", "Carnegie Mellon", "Georgia Tech", "UC Berkeley"];
const TOP_LIBERAL_ARTS = ["Williams", "Amherst", "Swarthmore", "Pomona", "Wellesley"];
const RESEARCH_ORIENTED = ["MIT", "Stanford", "Caltech", "Princeton", "Johns Hopkins"];

function hasSignal(
  profile: StudentProfileInput,
  signal: "mathRigor" | "research" | "leadership" | "competitions" | "projects" | "community"
): boolean {
  const classes = profile.currentClasses ?? [];
  const lowerClasses = classes.map((c) => c.toLowerCase());

  switch (signal) {
    case "mathRigor":
      return lowerClasses.some(
        (c) =>
          c.includes("calculus") ||
          c.includes("ap calc") ||
          c.includes("bc") ||
          c.includes("linear algebra") ||
          c.includes("multivariable")
      );
    case "research":
      return (
        (profile.extracurriculars ?? []).some((e) =>
          e.toLowerCase().includes("research")
        ) ||
        (profile.awards ?? []).some((a) => a.toLowerCase().includes("research"))
      );
    case "leadership":
      return (profile.leadershipExp ?? []).length > 0;
    case "competitions":
      return (
        (profile.awards ?? []).length > 0 ||
        (profile.extracurriculars ?? []).some((e) =>
          ["olympiad", "competition", "hackathon", "decathlon"].some((k) =>
            e.toLowerCase().includes(k)
          )
        )
      );
    case "projects":
      return (
        (profile.githubUrl?.length ?? 0) > 0 ||
        (profile.portfolioUrl?.length ?? 0) > 0 ||
        (profile.extracurriculars ?? []).some((e) =>
          ["project", "build", "develop"].some((k) => e.toLowerCase().includes(k))
        )
      );
    case "community":
      return (profile.extracurriculars ?? []).some((e) =>
        ["volunteer", "community", "service", "tutoring", "mentor"].some((k) =>
          e.toLowerCase().includes(k)
        )
      );
    default:
      return false;
  }
}

function buildActionsForCollege(
  college: string,
  major: string,
  profile: StudentProfileInput
): AdmissionsStrategyAction[] {
  const actions: AdmissionsStrategyAction[] = [];
  const hoursPerWeek = profile.hoursPerWeek ?? 10;
  const isSTEM = ["computer science", "engineering", "ai", "artificial intelligence", "math", "physics", "chemistry", "biology"].some(
    (m) => major.toLowerCase().includes(m)
  );
  const isTopSTEM = TOP_STEM_SCHOOLS.some((s) => college.toLowerCase().includes(s.toLowerCase()));
  const isResearchSchool = RESEARCH_ORIENTED.some((s) => college.toLowerCase().includes(s.toLowerCase()));

  // Math rigor (especially for STEM)
  if (!hasSignal(profile, "mathRigor") && isSTEM) {
    const feasibility = hoursPerWeek >= 8 ? 7 : 5;
    actions.push({
      action: "Take advanced mathematics such as AP Calculus BC or equivalent",
      impactScore: isTopSTEM ? 9 : 7,
      feasibilityScore: feasibility,
      timeline: "next academic year",
      reason: "Top STEM programs expect strong quantitative preparation. Calculus BC signals readiness for college-level math.",
    });
  }

  // Substantive project
  if (!hasSignal(profile, "projects") || (profile.githubUrl && !profile.portfolioUrl)) {
    const feasibility = hoursPerWeek >= 6 ? 8 : 6;
    const projectType = isSTEM
      ? "Develop a substantial project with real-world impact (e.g., app, research tool, open-source contribution)"
      : "Create a portfolio of work demonstrating depth in your intended major";
    actions.push({
      action: projectType,
      impactScore: isTopSTEM ? 9 : 8,
      feasibilityScore: feasibility,
      timeline: "3–6 months",
      reason: "Selective programs value demonstrated initiative and depth. A project with users or measurable impact stands out.",
    });
  }

  // Research (for research-oriented schools)
  if (!hasSignal(profile, "research") && isResearchSchool && isSTEM) {
    const feasibility = hoursPerWeek >= 10 ? 6 : 4;
    actions.push({
      action: "Pursue a research opportunity (mentorship, summer program, or independent project)",
      impactScore: 9,
      feasibilityScore: feasibility,
      timeline: "6–12 months",
      reason: "Research-oriented schools look for evidence of intellectual curiosity and scholarly potential.",
    });
  }

  // Leadership
  if (!hasSignal(profile, "leadership")) {
    const feasibility = hoursPerWeek >= 3 ? 8 : 7;
    actions.push({
      action: "Take on a formal leadership role (club officer, team captain, project lead)",
      impactScore: 8,
      feasibilityScore: feasibility,
      timeline: "3–6 months",
      reason: "Leadership demonstrates initiative and ability to influence others—a key differentiator for selective admissions.",
    });
  }

  // Competitions
  if (!hasSignal(profile, "competitions")) {
    const feasibility = hoursPerWeek >= 5 ? 7 : 5;
    const compType = isSTEM ? "Science Olympiad, hackathons, or subject Olympiads" : "Debate, Model UN, or academic competitions";
    actions.push({
      action: `Compete in ${compType}`,
      impactScore: 7,
      feasibilityScore: feasibility,
      timeline: "3–6 months",
      reason: "External validation through competitions adds credibility and demonstrates excellence in your area of interest.",
    });
  }

  // Community impact
  if (!hasSignal(profile, "community")) {
    const feasibility = hoursPerWeek >= 4 ? 8 : 6;
    actions.push({
      action: "Engage in sustained community service or tutoring aligned with your interests",
      impactScore: 7,
      feasibilityScore: feasibility,
      timeline: "3–6 months",
      reason: "Community impact shows values and commitment. Depth over breadth—consistent involvement matters.",
    });
  }

  // Coursework (if GPA is strong but rigor is lacking)
  const gpa = profile.gpa ?? 0;
  const hasAP = (profile.currentClasses ?? []).some((c) =>
    c.toLowerCase().includes("ap ") || c.toLowerCase().includes("ib ")
  );
  if (gpa >= 3.5 && !hasAP && isSTEM) {
    actions.push({
      action: "Add AP/IB or honors courses in your intended major area",
      impactScore: 8,
      feasibilityScore: hoursPerWeek >= 12 ? 6 : 5,
      timeline: "next academic year",
      reason: "Strong GPA without rigor can raise questions. Top schools expect challenging coursework.",
    });
  }

  // Test scores (if targeting very selective schools and scores are missing)
  const testScores = profile.testScores;
  const hasSAT = (testScores?.sat ?? 0) > 0;
  const hasACT = (testScores?.act ?? 0) > 0;
  if (!hasSAT && !hasACT && isTopSTEM) {
    actions.push({
      action: "Prepare for and take SAT or ACT; aim for scores in the school's middle 50% range",
      impactScore: 8,
      feasibilityScore: hoursPerWeek >= 5 ? 7 : 5,
      timeline: "3–6 months",
      reason: "Standardized scores remain one data point for selective schools. Strong scores strengthen the academic narrative.",
    });
  }

  // Sort by impact score descending, take top 5
  actions.sort((a, b) => b.impactScore - a.impactScore);
  return actions.slice(0, 5);
}

export function runAdmissionsStrategyOptimizer(
  profile: StudentProfileInput
): AdmissionsStrategyResult[] {
  const colleges = profile.targetColleges ?? [];
  const major = (profile.intendedMajors ?? [])[0] ?? "Undeclared";

  if (colleges.length === 0) {
    return [
      {
        college: "Sample Reach School",
        major,
        recommendations: buildActionsForCollege("Reach School", major, profile),
      },
    ];
  }

  return colleges.slice(0, 8).map((college) => ({
    college,
    major,
    recommendations: buildActionsForCollege(college, major, profile),
  }));
}
