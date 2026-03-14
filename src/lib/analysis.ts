/**
 * Student Roadmap AI - Analysis Service
 * In-memory fallback when Python intelligence service is unavailable.
 * Mirrors Python logic for consistency; swap for API/LLM in production.
 */

import type {
  Citation,
  CollegeEstimate,
  Recommendation,
  RoadmapOutput,
  StudentProfileInput,
  TimelineItem,
  TopAction,
} from "@/types";

function rec(
  name: string,
  reason: string,
  priority: "high" | "medium" | "low" = "medium"
): Recommendation {
  return { name, reason, priority };
}

function timeline(
  month: string,
  actions: string[],
  focus: string
): TimelineItem {
  return { month, actions, focus };
}

export function runAnalysis(profile: StudentProfileInput): RoadmapOutput {
  const {
    name = "Student",
    gradeLevel = "Unknown",
    gpa,
    intendedMajors = [],
    intendedIndustry = "",
    targetColleges = [],
    interests = [],
    extracurriculars = [],
    awards = [],
    leadershipExp = [],
    hoursPerWeek = 0,
  } = profile;

  const studentSummary =
    `${name} is a ${gradeLevel} student with interests in ${(interests as string[]).join(", ") || "various fields"}. ` +
    (gpa ? `GPA: ${gpa}. ` : "") +
    `Intended path: ${intendedIndustry || "TBD"}; majors: ${(intendedMajors as string[]).join(", ") || "undeclared"}. ` +
    `Target schools: ${(targetColleges as string[]).slice(0, 5).join(", ") || "Not specified"}.`;

  const strengths: string[] = [];
  if (gpa && gpa >= 3.5) strengths.push("Strong academic performance.");
  if (awards?.length)
    strengths.push(`Recognition through awards: ${(awards as string[]).slice(0, 3).join(", ")}.`);
  if (leadershipExp?.length) strengths.push("Demonstrated leadership experience.");
  if (extracurriculars?.length) strengths.push("Involved in extracurricular activities.");
  const strengthsAnalysis =
    strengths.length > 0 ? strengths.join(" ") : "Building a strong foundation.";

  const gaps: string[] = [];
  if (!leadershipExp?.length) gaps.push("Consider taking on leadership roles.");
  if (!awards?.length || (awards as string[]).length < 2)
    gaps.push("Pursue competitions or recognition opportunities.");
  if (hoursPerWeek && hoursPerWeek < 5)
    gaps.push("Limited hours may constrain extracurricular depth.");
  const gapsAnalysis =
    gaps.length > 0 ? gaps.join(" ") : "Profile is developing well.";

  const recommendedExtracurriculars: Recommendation[] = [
    rec("STEM Club / Robotics", "Aligns with technical interests and builds teamwork.", "high"),
    rec("Debate or Model UN", "Develops communication and critical thinking.", "medium"),
    rec("Community Service", "Demonstrates values and commitment.", "high"),
  ];

  const recommendedProjects: Recommendation[] = [
    rec("Personal Portfolio Website", "Showcases work and technical skills.", "high"),
    rec("Research or Capstone Project", "Demonstrates depth in intended major.", "high"),
  ];

  const courseworkSuggestions: Recommendation[] = [
    rec("AP/IB courses in intended focus", "Strengthens academic profile.", "high"),
    rec("Statistics or Data Science", "Valuable across disciplines.", "medium"),
  ];

  const competitions: Recommendation[] = [
    rec("Science Olympiad / USABO", "Academic recognition.", "high"),
    rec("Hackathons", "Hands-on technical experience.", "high"),
  ];

  const internshipsPrograms: Recommendation[] = [
    rec("Summer Research Program", "Research experience for college applications.", "high"),
    rec("Local Internship", "Real-world exposure to intended industry.", "medium"),
  ];

  const timeline3Month: TimelineItem[] = [
    timeline("Month 1", ["Identify 2-3 target extracurriculars", "Start portfolio or project"], "Foundation"),
    timeline("Month 2", ["Apply to summer programs", "Join new club or activity"], "Expansion"),
    timeline("Month 3", ["Prepare for upcoming exams", "Document achievements"], "Consolidation"),
  ];

  const timeline6Month: TimelineItem[] = [
    ...timeline3Month,
    timeline("Month 4", ["Begin leadership role", "Submit competition entries"], "Leadership"),
    timeline("Month 5", ["Summer program prep", "Refine college list"], "Planning"),
    timeline("Month 6", ["Execute summer plan", "Build relationships with mentors"], "Execution"),
  ];

  const timeline12Month: TimelineItem[] = [
    ...timeline6Month,
    timeline("Month 7-9", ["College application prep", "Standardized test planning"], "Applications"),
    timeline("Month 10-12", ["Finalize applications", "Pursue senior-year leadership"], "Final Push"),
  ];

  const colleges = (targetColleges as string[])?.length
    ? (targetColleges as string[]).slice(0, 5)
    : ["Reach School", "Target School", "Safety School"];
  const collegeCompetitiveness: { colleges: CollegeEstimate[]; summary: string } = {
    colleges: colleges.map((c) => ({
      name: c,
      tier: (c.toLowerCase().includes("target") ? "target" : c.toLowerCase().includes("safety") ? "safety" : "reach") as
        | "reach"
        | "target"
        | "safety"
        | "stretch",
      notes: `Continue building profile in ${intendedIndustry || "intended field"}.`,
      improvementAreas: ["Strong extracurriculars", "Clear narrative"],
    })),
    summary:
      "Profile is developing. Focus on leadership and distinct projects to strengthen applications.",
  };

  const topActions: TopAction[] = [
    { action: "Take on a leadership role", impact: "High - differentiates profile", priority: 1, timeframe: "3 months" },
    { action: "Complete a substantive project", impact: "High - demonstrates initiative", priority: 2, timeframe: "6 months" },
    { action: "Pursue 1-2 competitions", impact: "Medium - adds recognition", priority: 3, timeframe: "6 months" },
  ];

  const citations: Citation[] = [
    {
      title: "College Admissions and Holistic Review",
      source: "NACAC",
      year: 2023,
      excerpt: "Admissions consider academic and non-academic factors.",
    },
    {
      title: "Extracurricular Impact on Outcomes",
      source: "Education Policy",
      year: 2022,
      excerpt: "Depth often matters more than breadth.",
    },
  ];

  return {
    studentSummary,
    strengthsAnalysis,
    gapsAnalysis,
    recommendedExtracurriculars,
    recommendedProjects,
    courseworkSuggestions,
    competitions,
    internshipsPrograms,
    timeline3Month,
    timeline6Month,
    timeline12Month,
    collegeCompetitiveness,
    topActions,
    citations,
  };
}
