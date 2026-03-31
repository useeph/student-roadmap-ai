/**
 * Deterministic mock roadmap for demo mode when OPENAI_API_KEY is missing.
 * Produces strong, profile-aware outputs: strategy, projects, extracurriculars,
 * college chances, essay ideas, improvement actions.
 * Uses profile fields (GPA, majors, ECs, etc.) to vary recommendations—no randomness.
 */

import type { StudentProfileInput } from "@/types";
import type {
  OpenAIRoadmapResponse,
  CompetitivenessClassification,
} from "@/types/openai-roadmap";

/** Deterministic index 0..max-1 from a seed string */
function pickIndex(seed: string, max: number): number {
  if (max <= 0) return 0;
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return Math.abs(h) % max;
}

/** Deterministic selection from array */
function pick<T>(arr: T[], seed: string): T {
  return arr[pickIndex(seed, arr.length)];
}

/** Combine seeds for compound selection */
function seedFrom(
  ...parts: (string | number | undefined | null)[]
): string {
  return parts.filter((p) => p != null).join("|");
}

export function getMockRoadmap(
  profile: StudentProfileInput
): OpenAIRoadmapResponse {
  const name = profile.name ?? "Student";
  const gradeLevel = profile.gradeLevel ?? "Unknown";
  const gpa = profile.gpa;
  const currentClasses = profile.currentClasses ?? [];
  const intendedMajors = profile.intendedMajors ?? [];
  const targetColleges = profile.targetColleges ?? [];
  const extracurriculars = profile.extracurriculars ?? [];
  const leadershipExp = profile.leadershipExp ?? [];
  const awards = profile.awards ?? [];
  const interests = profile.interests ?? [];
  const hoursPerWeek = profile.hoursPerWeek ?? 10;

  const major1 = intendedMajors[0] ?? "";
  const majorKey = major1.toLowerCase().slice(0, 12);
  const hasLeadership = leadershipExp.length > 0;
  const hasAwards = awards.length > 0;
  const ecCount = extracurriculars.length;
  const gpaTier =
    gpa == null
      ? "unknown"
      : gpa >= 3.9
        ? "elite"
        : gpa >= 3.6
          ? "strong"
          : gpa >= 3.3
            ? "solid"
            : "developing";

  // ——— Student summary ———
  const summaryParts: string[] = [];
  summaryParts.push(
    `${name} is a ${gradeLevel} student with a clear interest in ${major1 || "exploring academics"}.`
  );
  if (gpa != null)
    summaryParts.push(
      `GPA: ${gpa}. ${gpa >= 3.7 ? "Strong academic record." : "Room to strengthen grades and rigor."}`
    );
  if (currentClasses.length)
    summaryParts.push(
      `Current coursework includes ${currentClasses.slice(0, 4).join(", ")}.`
    );
  summaryParts.push(
    `Targeting ${targetColleges.length ? targetColleges.slice(0, 4).join(", ") : "a range of schools"}. ` +
      "Admissions outcomes are uncertain—these estimates are guidance only, not guarantees."
  );
  const studentSummary = summaryParts.join(" ");

  // ——— Strengths ———
  const strengths: string[] = [];
  if (gpa != null && gpa >= 3.5)
    strengths.push("Strong academic performance and likely rigor.");
  if (awards.length)
    strengths.push(`Recognition: ${awards.slice(0, 3).join("; ")}.`);
  if (leadershipExp.length)
    strengths.push(`Leadership: ${leadershipExp.slice(0, 2).join(", ")}.`);
  if (ecCount >= 2)
    strengths.push(
      `Active in ${extracurriculars.slice(0, 2).join(" and ")}—building depth.`
    );
  if (interests.length)
    strengths.push(
      `Clear interests in ${interests.slice(0, 3).join(", ")}—helps narrative coherence.`
    );
  if (profile.githubUrl || profile.portfolioUrl)
    strengths.push("Existing portfolio or technical presence.");
  if (strengths.length === 0)
    strengths.push("Foundational profile with room to build.");

  // ——— Gaps ———
  const gaps: string[] = [];
  if (!hasLeadership)
    gaps.push("Take on a leadership role—even a small one—to show initiative.");
  if (awards.length < 1 && ecCount > 0)
    gaps.push("Pursue competitions or recognition in your areas of interest.");
  if (hoursPerWeek != null && hoursPerWeek < 5)
    gaps.push("Limited hours—prioritize 2–3 high-impact activities over breadth.");
  if (!profile.githubUrl && !profile.portfolioUrl && /cs|computer|software|data|engineering/i.test(major1))
    gaps.push("Build a portfolio of projects to demonstrate technical depth.");
  if (gaps.length === 0)
    gaps.push("Continue deepening existing commitments and seeking new challenges.");

  // ——— Strategy ———
  const strategyPools = {
    summaries: [
      `Your biggest levers: depth over breadth, a cohesive narrative around ${major1 || "your interests"}, and demonstrable initiative. Selective schools look for sustained impact—not scattered involvement.`,
      `Given your profile, prioritize building one or two signature strengths. A clear story around ${major1 || "your goals"} plus concrete evidence (projects, leadership, recognition) matters more than activity count.`,
      `Focus on alignment: tie extracurriculars, projects, and essays to ${major1 || "your intended path"}. Admissions values narrative coherence and demonstrated commitment.`,
    ],
    priorities: [
      {
        title: "Develop 1–2 signature projects or research",
        reason: "Demonstrates initiative and depth in your intended field.",
        impact: "High" as const,
      },
      {
        title: "Seek a leadership role in an existing activity",
        reason: "Shows you can influence others—key for selective admissions.",
        impact: "High" as const,
      },
      {
        title: "Compete or pursue external validation",
        reason: "Awards and competitions add credibility to your profile.",
        impact: "High" as const,
      },
      {
        title: "Build a compelling essay narrative",
        reason: "Personal story differentiates you from similar profiles.",
        impact: "Medium" as const,
      },
      {
        title: "Deepen rather than add activities",
        reason: "One sustained commitment beats multiple shallow ones.",
        impact: "Medium" as const,
      },
      {
        title: "Align ECs with your intended major",
        reason: "Shows genuine interest and trajectory.",
        impact: "Medium" as const,
      },
    ],
  };
  const stratSeed = seedFrom(name, major1, gpaTier);
  const stratSummary = pick(strategyPools.summaries, stratSeed);
  const priorityIndices = new Set<number>();
  for (let i = 0; i < 4; i++) {
    let idx = pickIndex(seedFrom(stratSeed, i), strategyPools.priorities.length);
    while (priorityIndices.has(idx))
      idx = (idx + 1) % strategyPools.priorities.length;
    priorityIndices.add(idx);
  }
  const topPriorities = [...priorityIndices]
    .sort((a, b) => a - b)
    .map((i) => strategyPools.priorities[i]);

  const strategy = {
    summary: stratSummary,
    topPriorities,
  };

  // ——— Projects (major-aware) ———
  const projectPools: Record<string, Array<{
    title: string;
    description: string;
    technologies: string[];
    timeEstimate: string;
    difficulty: "Beginner" | "Intermediate" | "Advanced";
    whyItStandsOut: string;
  }>> = {
    default: [
      {
        title: "Research or Capstone Project",
        description: "Demonstrates depth in your intended major and intellectual curiosity.",
        technologies: ["Varies by field"],
        timeEstimate: "3–6 months",
        difficulty: "Advanced",
        whyItStandsOut: "Shows commitment and academic readiness for selective programs.",
      },
      {
        title: "Portfolio or Showcase Website",
        description: "Central place to display work, projects, and achievements.",
        technologies: ["HTML", "CSS", "JavaScript", "React"],
        timeEstimate: "2–4 weeks",
        difficulty: "Intermediate",
        whyItStandsOut: "Tangible evidence of skills; easy to share with admissions.",
      },
    ],
    cs: [
      {
        title: "Open-Source Contribution or Side Project",
        description: "Build or contribute to a real application—API, web app, or tool.",
        technologies: ["Python", "JavaScript", "React", "Git"],
        timeEstimate: "1–3 months",
        difficulty: "Intermediate",
        whyItStandsOut: "Demonstrates coding ability beyond coursework; shows initiative.",
      },
      {
        title: "Data Analysis or ML Project",
        description: "Use public datasets to answer a question or build a small predictor.",
        technologies: ["Python", "pandas", "scikit-learn", "Jupyter"],
        timeEstimate: "2–4 months",
        difficulty: "Advanced",
        whyItStandsOut: "Aligns with CS/data science; shows analytical and technical depth.",
      },
    ],
    engineering: [
      {
        title: "Hardware or Prototype Build",
        description: "Design and build a physical prototype—sensors, robotics, or electronics.",
        technologies: ["Arduino", "Raspberry Pi", "CAD", "3D printing"],
        timeEstimate: "2–4 months",
        difficulty: "Advanced",
        whyItStandsOut: "Shows hands-on engineering and problem-solving beyond theory.",
      },
    ],
    econ: [
      {
        title: "Economic Data Analysis",
        description: "Analyze trends (e.g., labor market, housing) and present findings.",
        technologies: ["Excel", "Python", "R", "Tableau"],
        timeEstimate: "2–3 months",
        difficulty: "Intermediate",
        whyItStandsOut: "Demonstrates quantitative and analytical skills valued in econ.",
      },
    ],
    bio: [
      {
        title: "Independent Research or Lab Work",
        description: "Pursue a small research question or assist in a lab setting.",
        technologies: ["Lab techniques", "Data analysis", "Literature review"],
        timeEstimate: "3–6 months",
        difficulty: "Advanced",
        whyItStandsOut: "Shows research readiness and commitment to STEM inquiry.",
      },
    ],
    business: [
      {
        title: "Startup or Venture Idea Validation",
        description: "Validate an idea with surveys, interviews, and a simple business model.",
        technologies: ["Surveys", "Spreadsheets", "Pitch deck"],
        timeEstimate: "1–2 months",
        difficulty: "Intermediate",
        whyItStandsOut: "Demonstrates initiative and business thinking.",
      },
    ],
  };

  const projKey = /computer|cs|software|data/i.test(major1)
    ? "cs"
    : /engineer/i.test(major1)
      ? "engineering"
      : /econ|economics/i.test(major1)
        ? "econ"
        : /business/i.test(major1)
          ? "business"
          : /bio|premed|chem|medicine/i.test(major1)
            ? "bio"
            : "default";
  const majorPool = projectPools[projKey] ?? projectPools.default;
  const defaultPool = projectPools.default;
  const projSeed = seedFrom(name, major1);
  const p1 = majorPool[pickIndex(projSeed, majorPool.length)];
  const p2 = defaultPool[pickIndex(seedFrom(projSeed, "alt"), defaultPool.length)];
  const projects = p1.title === p2.title
    ? [p1]
    : [p1, p2];

  // ——— Extracurriculars ———
  const ecRecs = [
    {
      title: "STEM Club, Robotics, or Coding Group",
      reason: "Aligns with technical interests; offers leadership and project opportunities.",
      howToStandOut: "Found a chapter or lead a subteam; document measurable outcomes.",
      priority: "High" as const,
    },
    {
      title: "Debate, Model UN, or Speech",
      reason: "Develops communication and critical thinking—valued across majors.",
      howToStandOut: "Compete at regional/national level; run for officer position.",
      priority: "Medium" as const,
    },
    {
      title: "Research or Lab Experience",
      reason: "Demonstrates academic initiative and intellectual curiosity.",
      howToStandOut: "Secure a formal position; produce a write-up or poster.",
      priority: "High" as const,
    },
    {
      title: "Community Service or Volunteering",
      reason: "Shows values and sustained commitment to something beyond academics.",
      howToStandOut: "Organize a project or lead a volunteer initiative with impact.",
      priority: "High" as const,
    },
    {
      title: "Publication, Blog, or Content Creation",
      reason: "Demonstrates expertise and communication in your area of interest.",
      howToStandOut: "Publish consistently; build a small audience or portfolio.",
      priority: "Medium" as const,
    },
  ];
  const ecSeed = seedFrom(name, ecCount, majorKey);
  const usedEc = new Set<number>();
  const extracurricularsSection = [];
  for (let i = 0; i < 3; i++) {
    let idx = pickIndex(seedFrom(ecSeed, i), ecRecs.length);
    while (usedEc.has(idx)) idx = (idx + 1) % ecRecs.length;
    usedEc.add(idx);
    extracurricularsSection.push(ecRecs[idx]);
  }

  // ——— College chances (GPA/EC-aware) ———
  const colleges = targetColleges.length
    ? targetColleges.slice(0, 6)
    : ["MIT", "Stanford", "UC Berkeley", "State Flagship", "Regional University"];
  const eliteSchools = ["MIT", "Stanford", "Harvard", "Yale", "Princeton", "Caltech", "CMU", "Berkeley"];
  const isElite = (c: string) =>
    eliteSchools.some((e) => c.toLowerCase().includes(e.toLowerCase()));

  const classPool: CompetitivenessClassification[] = [
    "Extreme Reach",
    "Reach",
    "Reach",
    "Target",
    "Target",
    "Likely",
    "Safety",
    "Safety",
  ];
  const probBands: Record<
    CompetitivenessClassification,
    [number, number]
  > = {
    "Extreme Reach": [5, 15],
    Reach: [10, 25],
    Target: [25, 50],
    Likely: [45, 70],
    Safety: [60, 85],
  };

  const collegeChances = colleges.map((c, i) => {
    const colSeed = seedFrom(c, gpa ?? 0, ecCount, hasLeadership ? 1 : 0);
    const isEliteSchool = isElite(c);
    let classIdx: number;
    if (gpaTier === "elite" && hasLeadership && hasAwards)
      classIdx = isEliteSchool ? 1 : 2; // Reach or Target
    else if (gpaTier === "strong" && (hasLeadership || hasAwards))
      classIdx = isEliteSchool ? 0 : 3; // Extreme Reach or Target
    else if (gpaTier === "solid")
      classIdx = isEliteSchool ? 1 : 3 + (i % 2); // Reach, or Target/Likely
    else
      classIdx = Math.min(2 + pickIndex(colSeed, 2), classPool.length - 1);

    const cl = classPool[Math.min(classIdx, classPool.length - 1)];
    const [low, high] = probBands[cl];
    const lowAdj = low + pickIndex(colSeed, 5);
    const highAdj = Math.min(high + pickIndex(seedFrom(colSeed, "h"), 8), 90);

    const improvPool = [
      "Leadership in an activity aligned with your major.",
      "A substantive project or research with measurable impact.",
      "External validation (competition, award, publication).",
      "Stronger standardized test scores.",
      "More rigor in coursework (AP/IB, advanced electives).",
      "Deeper involvement in 1–2 activities rather than breadth.",
    ];
    const improvSeed = seedFrom(c, i);
    const biggestImprovementNeeded = pick(improvPool, improvSeed);

    return {
      collegeName: c,
      intendedMajor: major1 || "Undeclared",
      classification: cl,
      probabilityBandLow: Math.max(0, Math.min(95, lowAdj)),
      probabilityBandHigh: Math.max(lowAdj + 5, Math.min(95, highAdj)),
      explanation: `${
        cl === "Extreme Reach" || cl === "Reach"
          ? "Highly selective. Continue strengthening profile in leadership, projects, and academics."
          : cl === "Target"
            ? "Competitive but within range. Focus on narrative coherence and depth."
            : "Strong fit. Ensure application quality and fit alignment."
      } Admissions outcomes are uncertain; these are estimates only, not guarantees.`,
      biggestImprovementNeeded,
    };
  });

  // ——— Essay ideas (personalized) ———
  const essayPools = {
    fromInterests: interests.length
      ? {
          theme: `How ${interests[0]} shaped your path`,
          storyOutline: `Trace moments that sparked your interest in ${interests[0]} and how it led to ${major1 || "your goals"}.`,
          whatItReveals: "Intellectual curiosity, self-awareness.",
          whyItIsCompelling: "Shows genuine motivation—admissions values authenticity.",
        }
      : null,
    fromEc: extracurriculars.length
      ? {
          theme: `What you learned leading or participating in ${extracurriculars[0]}`,
          storyOutline: `A specific experience in ${extracurriculars[0]}—challenge, pivot, or moment of growth.`,
          whatItReveals: "Leadership, resilience, teamwork.",
          whyItIsCompelling: "Concrete evidence of impact beyond the activity name.",
        }
      : null,
    fromGap: !hasLeadership
      ? {
          theme: "A challenge that pushed you out of your comfort zone",
          storyOutline: "A setback or obstacle you faced and how you responded.",
          whatItReveals: "Resilience, growth mindset.",
          whyItIsCompelling: "Demonstrates character beyond achievements.",
        }
      : null,
    fromAward: awards.length
      ? {
          theme: `The story behind ${awards[0]}`,
          storyOutline: `How you prepared, what you learned, and what it means to you beyond the recognition.`,
          whatItReveals: "Commitment, reflection, humility.",
          whyItIsCompelling: "Turns an accolade into a narrative of growth.",
        }
      : null,
    generic: [
      {
        theme: "How your background shaped your interests",
        storyOutline: "Trace experiences that led to your chosen major and goals.",
        whatItReveals: "Self-awareness, intellectual curiosity.",
        whyItIsCompelling: "Connects identity to academic trajectory—admissions values authenticity.",
      },
      {
        theme: "What you would bring to campus",
        storyOutline: "Articulate your unique contribution to the college community.",
        whatItReveals: "Community orientation, self-reflection.",
        whyItIsCompelling: "Shows fit beyond rankings.",
      },
      {
        theme: "A problem you want to solve",
        storyOutline: "A real-world issue tied to your major and how you’ve begun engaging with it.",
        whatItReveals: "Purpose, initiative.",
        whyItIsCompelling: "Demonstrates direction and commitment.",
      },
    ],
  };

  const essayCandidates: typeof essayPools.generic = [];
  if (essayPools.fromInterests) essayCandidates.push(essayPools.fromInterests);
  if (essayPools.fromEc) essayCandidates.push(essayPools.fromEc);
  if (essayPools.fromGap) essayCandidates.push(essayPools.fromGap);
  if (essayPools.fromAward) essayCandidates.push(essayPools.fromAward);
  essayCandidates.push(...essayPools.generic);

  const essaySeed = seedFrom(name, major1, interests.join(""));
  const usedEssay = new Set<number>();
  const essayIdeas = [];
  for (let i = 0; i < 3; i++) {
    let idx = pickIndex(seedFrom(essaySeed, i), essayCandidates.length);
    while (usedEssay.has(idx)) idx = (idx + 1) % essayCandidates.length;
    usedEssay.add(idx);
    essayIdeas.push(essayCandidates[idx]);
  }

  // ——— Timeline ———
  const timeline = [
    {
      period: "Next 3 months",
      actions: [
        "Identify 2–3 target activities to deepen",
        "Start or scope a project aligned with your major",
        "Research and apply to summer programs or internships",
      ],
    },
    {
      period: "3–6 months",
      actions: [
        "Take on or grow a leadership role",
        "Submit to competitions or pursue recognition",
        "Refine college list and visit if possible",
      ],
    },
    {
      period: "6–12 months",
      actions: [
        "Finalize project and document impact",
        "Begin essay drafting and application prep",
        "Plan standardized tests if not yet complete",
      ],
    },
  ];

  // ——— Improvement actions (no duplicates across colleges) ———
  const actionPool = [
    {
      actionTitle: "Take on a leadership role in an existing activity",
      impactScore: 8,
      feasibilityScore: 7,
      timeHorizon: "3–6 months",
      explanation: "Differentiates profile; shows initiative.",
    },
    {
      actionTitle: "Complete a substantive project in your intended major",
      impactScore: 9,
      feasibilityScore: 6,
      timeHorizon: "3–6 months",
      explanation: "Demonstrates depth and technical or intellectual initiative.",
    },
    {
      actionTitle: "Pursue a competition or external recognition",
      impactScore: 8,
      feasibilityScore: 7,
      timeHorizon: "3–6 months",
      explanation: "Adds credibility and external validation.",
    },
    {
      actionTitle: "Strengthen standardized test scores",
      impactScore: 7,
      feasibilityScore: 8,
      timeHorizon: "3–6 months",
      explanation: "Improves academic competitiveness.",
    },
    {
      actionTitle: "Add rigor to coursework (AP/IB, honors)",
      impactScore: 7,
      feasibilityScore: 6,
      timeHorizon: "6–12 months",
      explanation: "Signals academic preparedness.",
    },
    {
      actionTitle: "Build a portfolio or publish work",
      impactScore: 8,
      feasibilityScore: 7,
      timeHorizon: "3–6 months",
      explanation: "Tangible evidence of skills and initiative.",
    },
  ];

  const usedActions = new Set<string>();
  const improvementActions = colleges.slice(0, 4).map((collegeName, collegeIdx) => {
    const colSeed = seedFrom(collegeName, collegeIdx);
    const chosen: typeof actionPool[0][] = [];
    for (let j = 0; j < 2; j++) {
      let idx = pickIndex(seedFrom(colSeed, j), actionPool.length);
      let attempts = 0;
      while (
        usedActions.has(actionPool[idx].actionTitle) &&
        attempts < actionPool.length
      ) {
        idx = (idx + 1) % actionPool.length;
        attempts++;
      }
      if (!usedActions.has(actionPool[idx].actionTitle)) {
        usedActions.add(actionPool[idx].actionTitle);
        chosen.push(actionPool[idx]);
      }
    }
    if (chosen.length === 0)
      chosen.push(
        actionPool[pickIndex(seedFrom(colSeed, "fallback"), actionPool.length)]
      );
    return {
      collegeName,
      actions: chosen.map((a) => ({ ...a })),
    };
  });

  // ——— Final advice ———
  const finalAdvice =
    "Focus on depth over breadth. Build a strong narrative around " +
    (major1 ? `${major1} ` : "your interests ") +
    "and back it with concrete evidence—projects, leadership, recognition. " +
    "Admissions outcomes are uncertain; these estimates are guidance only, not guarantees. " +
    "Work with counselors and admissions offices for official information.";

  return {
    studentSummary,
    strengths,
    gaps,
    strategy,
    projects,
    extracurriculars: extracurricularsSection,
    collegeChances,
    essayIdeas,
    timeline,
    improvementActions,
    finalAdvice,
  };
}
