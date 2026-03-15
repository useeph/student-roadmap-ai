/**
 * Deterministic mock roadmap for demo mode when OPENAI_API_KEY is missing.
 * Produces a valid OpenAIRoadmapResponse from the student profile.
 */

import type { StudentProfileInput } from "@/types";
import type { OpenAIRoadmapResponse } from "@/types/openai-roadmap";

export function getMockRoadmap(profile: StudentProfileInput): OpenAIRoadmapResponse {
  const name = profile.name ?? "Student";
  const gradeLevel = profile.gradeLevel ?? "Unknown";
  const gpa = profile.gpa;
  const intendedMajors = profile.intendedMajors ?? [];
  const targetColleges = profile.targetColleges ?? [];
  const extracurriculars = profile.extracurriculars ?? [];
  const leadershipExp = profile.leadershipExp ?? [];
  const awards = profile.awards ?? [];
  const hoursPerWeek = profile.hoursPerWeek ?? 10;

  const studentSummary =
    `${name} is a ${gradeLevel} student. ` +
    (gpa ? `GPA: ${gpa}. ` : "") +
    `Intended majors: ${intendedMajors.length ? intendedMajors.join(", ") : "undeclared"}. ` +
    `Target schools: ${targetColleges.length ? targetColleges.slice(0, 4).join(", ") : "not specified"}.`;

  const strengths: string[] = [];
  if (gpa && gpa >= 3.5) strengths.push("Strong academic performance.");
  if (awards.length) strengths.push(`Recognition through awards: ${awards.slice(0, 2).join(", ")}.`);
  if (leadershipExp.length) strengths.push("Demonstrated leadership experience.");
  if (extracurriculars.length) strengths.push("Involved in extracurricular activities.");
  if (strengths.length === 0) strengths.push("Building a strong foundation.");

  const gaps: string[] = [];
  if (!leadershipExp.length) gaps.push("Consider taking on leadership roles.");
  if (awards.length < 2) gaps.push("Pursue competitions or recognition opportunities.");
  if (hoursPerWeek < 5) gaps.push("Limited hours may constrain extracurricular depth.");
  if (gaps.length === 0) gaps.push("Profile is developing well.");

  const extracurricularRecommendations = [
    { title: "STEM Club / Robotics", reason: "Aligns with technical interests and builds teamwork.", priority: "High" as const },
    { title: "Debate or Model UN", reason: "Develops communication and critical thinking.", priority: "Medium" as const },
    { title: "Community Service", reason: "Demonstrates values and commitment.", priority: "High" as const },
  ];

  const projectIdeas = [
    { title: "Personal Portfolio Website", description: "Showcases work and technical skills.", timeEstimate: "2-4 weeks", difficulty: "Beginner" as const },
    { title: "Research or Capstone Project", description: "Demonstrates depth in intended major.", timeEstimate: "3-6 months", difficulty: "Advanced" as const },
  ];

  const courseworkSuggestions = [
    "AP/IB courses in intended focus",
    "Statistics or Data Science",
  ];

  const competitionSuggestions = [
    "Science Olympiad / USABO",
    "Hackathons",
  ];

  const timeline = [
    { period: "Next 3 months", actions: ["Identify 2-3 target extracurriculars", "Start portfolio or project", "Apply to summer programs"] },
    { period: "3-6 months", actions: ["Begin leadership role", "Submit competition entries", "Refine college list"] },
    { period: "6-12 months", actions: ["College application prep", "Standardized test planning", "Finalize applications"] },
  ];

  const colleges = targetColleges.length ? targetColleges.slice(0, 5) : ["Reach School", "Target School", "Safety School"];
  const competitivenessEstimates = colleges.map((c, i) => ({
    collegeName: c,
    intendedMajor: intendedMajors[0] ?? "Undeclared",
    classification: i === 0 ? "Reach" as const : i === 1 ? "Target" as const : "Safety" as const,
    probabilityBandLow: 10 + i * 15,
    probabilityBandHigh: 25 + i * 20,
    explanation: `Continue building profile in ${profile.intendedIndustry ?? "intended field"}. Admissions outcomes are uncertain and estimates are not guarantees.`,
  }));

  const improvementActions = colleges.slice(0, 3).map((collegeName) => ({
    collegeName,
    actions: [
      { actionTitle: "Take on a leadership role", impactScore: 8, feasibilityScore: 7, timeHorizon: "3-6 months", explanation: "Differentiates profile." },
      { actionTitle: "Complete a substantive project", impactScore: 9, feasibilityScore: 6, timeHorizon: "3-6 months", explanation: "Demonstrates initiative." },
    ],
  }));

  const finalAdvice =
    "Focus on depth over breadth. Build a strong narrative around your interests. " +
    "Admissions outcomes are uncertain—these estimates are guidance only, not guarantees. " +
    "Work with counselors and admissions offices for official information.";

  return {
    studentSummary,
    strengths,
    gaps,
    extracurricularRecommendations,
    projectIdeas,
    courseworkSuggestions,
    competitionSuggestions,
    timeline,
    competitivenessEstimates,
    improvementActions,
    finalAdvice,
  };
}
