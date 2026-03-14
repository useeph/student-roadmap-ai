"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  GraduationCap,
  Loader2,
  Target,
  TrendingUp,
  BookOpen,
  Award,
  Briefcase,
  Calendar,
  Lightbulb,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Disclaimer } from "@/components/Disclaimer";
import type {
  Citation,
  CollegeEstimate,
  Recommendation,
  AdmissionsStrategyResult,
  RoadmapOutput,
  TimelineItem,
  TopAction,
} from "@/types";

interface RoadmapData {
  student: { id: string; name: string; gradeLevel?: string | null; graduationYear?: number | null };
  roadmap: RoadmapOutput;
}

function RecList({
  items,
  title,
  icon: Icon,
}: {
  items: Recommendation[];
  title: string;
  icon: React.ElementType;
}) {
  return (
    <Card className="p-6 bg-slate-900/50 border-slate-800">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="h-5 w-5 text-indigo-400" />
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      <ul className="space-y-3">
        {items.map((r, i) => (
          <li key={i} className="flex items-start gap-2">
            <Badge
              variant={r.priority === "high" ? "default" : "secondary"}
              className="shrink-0 mt-0.5"
            >
              {r.priority}
            </Badge>
            <div>
              <span className="font-medium text-white">{r.name}</span>
              <p className="text-sm text-slate-400 mt-0.5">{r.reason}</p>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function TimelineSection({
  items,
  label,
}: {
  items: TimelineItem[];
  label: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const displayItems = expanded ? items : items.slice(0, 4);

  return (
    <Card className="p-6 bg-slate-900/50 border-slate-800">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 w-full text-left mb-4 group"
      >
        <Calendar className="h-5 w-5 text-indigo-400" />
        <h3 className="text-lg font-semibold text-white">{label}</h3>
        {expanded ? (
          <ChevronDown className="h-5 w-5 text-slate-400 ml-auto group-hover:text-white" />
        ) : (
          <ChevronRight className="h-5 w-5 text-slate-400 ml-auto group-hover:text-white" />
        )}
      </button>
      <ol className="space-y-4">
        {displayItems.map((t, i) => (
          <li key={i} className="border-l-2 border-indigo-500/30 pl-4">
            <p className="font-medium text-indigo-300 text-sm">{t.month}</p>
            <p className="text-slate-400 text-sm mt-1">{t.focus}</p>
            <ul className="mt-2 space-y-1">
              {t.actions.map((a, j) => (
                <li key={j} className="text-white text-sm flex items-center gap-2">
                  <span className="text-indigo-400">•</span>
                  {a}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
      {!expanded && items.length > 4 && (
        <p className="text-slate-500 text-sm mt-2">
          +{items.length - 4} more months — click to expand
        </p>
      )}
    </Card>
  );
}

function CollegeCard({ c }: { c: CollegeEstimate }) {
  const tierColors: Record<string, string> = {
    reach: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    stretch: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    target: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    safety: "bg-sky-500/20 text-sky-300 border-sky-500/30",
  };
  const tier = tierColors[c.tier] ?? "bg-slate-500/20 text-slate-300";

  return (
    <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-white">{c.name}</span>
        <Badge className={tier}>{c.tier}</Badge>
      </div>
      {c.notes && <p className="text-sm text-slate-400 mt-2">{c.notes}</p>}
      {c.improvementAreas && c.improvementAreas.length > 0 && (
        <ul className="mt-2 text-xs text-slate-500 space-y-1">
          {c.improvementAreas.map((a, i) => (
            <li key={i}>• {a}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CitationCard({ c }: { c: Citation }) {
  return (
    <div className="flex gap-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
      <BookOpen className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
      <div>
        <p className="font-medium text-slate-200 text-sm">{c.title}</p>
        <p className="text-xs text-slate-500">{c.source}{c.year ? ` (${c.year})` : ""}</p>
        {c.excerpt && <p className="text-xs text-slate-400 mt-1">{c.excerpt}</p>}
        {c.url && (
          <a
            href={c.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-indigo-400 hover:underline mt-1 inline-flex items-center gap-1"
          >
            Source <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  );
}

function OptimizerCollegeSection({ result }: { result: AdmissionsStrategyResult }) {
  return (
    <Card className="p-6 bg-slate-900/50 border-slate-800">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="h-5 w-5 text-amber-400" />
        <h3 className="text-lg font-semibold text-white">{result.college}</h3>
        <Badge variant="secondary" className="text-xs">{result.major}</Badge>
      </div>
      <p className="text-slate-400 text-sm mb-4">
        Highest-impact actions to strengthen your application for {result.college}
      </p>
      <ol className="space-y-4">
        {result.recommendations.map((rec, i) => (
          <li key={i} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="font-medium text-white">{rec.action}</span>
              <div className="flex gap-2">
                <Badge className="bg-emerald-500/20 text-emerald-300 text-xs">
                  Impact {rec.impactScore}
                </Badge>
                <Badge className="bg-sky-500/20 text-sky-300 text-xs">
                  Feasibility {rec.feasibilityScore}
                </Badge>
              </div>
            </div>
            <p className="text-sm text-slate-400 mb-1">{rec.reason}</p>
            <p className="text-xs text-indigo-400">{rec.timeline}</p>
          </li>
        ))}
      </ol>
    </Card>
  );
}

export default function RoadmapPage({ params }: { params: { id: string } }) {
  const id = params.id;
  const [data, setData] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchRoadmap = async () => {
      try {
        const res = await fetch(`/api/roadmap/${id}`);
        const json = await res.json();
        if (!res.ok) {
          setError(json.error ?? "Failed to load");
          return;
        }

        if (json.hasRoadmap && json.roadmap) {
          setData({ student: json.student, roadmap: json.roadmap });
        } else {
          // No roadmap — trigger analysis
          setAnalyzing(true);
          const analyzeRes = await fetch("/api/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ studentId: id }),
          });
          const analyzeJson = await analyzeRes.json();
          if (!analyzeRes.ok) {
            setError(analyzeJson.error ?? "Analysis failed");
            return;
          }

          // Refetch roadmap
          const refetch = await fetch(`/api/roadmap/${id}`);
          const refetchJson = await refetch.json();
          if (refetchJson.hasRoadmap && refetchJson.roadmap) {
            setData({ student: refetchJson.student, roadmap: refetchJson.roadmap });
          } else {
            setError("Roadmap generation did not complete");
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
        setAnalyzing(false);
      }
    };

    fetchRoadmap();
  }, [id]);

  if (loading || analyzing) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-indigo-400 animate-spin mx-auto mb-4" />
          <p className="text-white font-medium">
            {analyzing ? "Generating your roadmap..." : "Loading..."}
          </p>
          <p className="text-slate-400 text-sm mt-1">
            {analyzing ? "Analyzing your profile and building recommendations" : "Please wait"}
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <p className="text-red-400 mb-4">{error ?? "Not found"}</p>
          <Link href="/intake">
            <Button variant="outline">Start over</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const { student, roadmap } = data;
  const r = roadmap as unknown as {
    studentSummary?: string;
    strengthsAnalysis?: string;
    gapsAnalysis?: string;
    recommendedExtracurriculars?: Recommendation[];
    recommendedProjects?: Recommendation[];
    courseworkSuggestions?: Recommendation[];
    competitions?: Recommendation[];
    internshipsPrograms?: Recommendation[];
    timeline3Month?: TimelineItem[];
    timeline6Month?: TimelineItem[];
    timeline12Month?: TimelineItem[];
    collegeCompetitiveness?: { colleges: CollegeEstimate[]; summary?: string };
    topActions?: TopAction[];
    citations?: Citation[];
    admissionsStrategyOptimizer?: AdmissionsStrategyResult[];
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <header className="mb-12">
          <div className="flex items-center gap-2 mb-2">
            <GraduationCap className="h-8 w-8 text-indigo-400" />
            <h1 className="text-2xl font-bold text-white">Roadmap for {student.name}</h1>
          </div>
          <p className="text-slate-400">
            {student.gradeLevel && `${student.gradeLevel} • `}
            {student.graduationYear && `Class of ${student.graduationYear}`}
          </p>
        </header>

        <Disclaimer className="mb-12" />

        {/* Summary & strengths / gaps */}
        <section className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="p-6 bg-slate-900/50 border-slate-800">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-indigo-400" />
              Student summary
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              {r.studentSummary ?? "No summary available."}
            </p>
          </Card>
          <Card className="p-6 bg-slate-900/50 border-slate-800">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-400" />
              Strengths & gaps
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-emerald-400 uppercase tracking-wider mb-1">
                  Strengths
                </p>
                <p className="text-slate-300 text-sm">{r.strengthsAnalysis ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-amber-400 uppercase tracking-wider mb-1">
                  Gaps
                </p>
                <p className="text-slate-300 text-sm">{r.gapsAnalysis ?? "—"}</p>
              </div>
            </div>
          </Card>
        </section>

        {/* Top actions */}
        {r.topActions && r.topActions.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-indigo-400" />
              Top actions
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {r.topActions.map((a, i) => (
                <Card key={i} className="p-4 bg-indigo-500/5 border-indigo-500/20">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium text-white">{a.action}</span>
                    <Badge variant="secondary">{a.priority}</Badge>
                  </div>
                  <p className="text-sm text-slate-400 mt-1">{a.impact}</p>
                  {a.timeframe && (
                    <p className="text-xs text-indigo-400 mt-2">{a.timeframe}</p>
                  )}
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Recommendations grid */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-6">Recommendations</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {r.recommendedExtracurriculars?.length ? (
              <RecList
                items={r.recommendedExtracurriculars}
                title="Extracurriculars"
                icon={Award}
              />
            ) : null}
            {r.recommendedProjects?.length ? (
              <RecList items={r.recommendedProjects} title="Projects" icon={Briefcase} />
            ) : null}
            {r.courseworkSuggestions?.length ? (
              <RecList
                items={r.courseworkSuggestions}
                title="Coursework"
                icon={BookOpen}
              />
            ) : null}
            {r.competitions?.length ? (
              <RecList items={r.competitions} title="Competitions" icon={Award} />
            ) : null}
          </div>
          {r.internshipsPrograms?.length ? (
            <div className="mt-6">
              <RecList
                items={r.internshipsPrograms}
                title="Internships & summer programs"
                icon={Briefcase}
              />
            </div>
          ) : null}
        </section>

        {/* Timelines */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-6">Timelines</h2>
          <div className="space-y-6">
            {r.timeline3Month?.length ? (
              <TimelineSection items={r.timeline3Month} label="3‑month plan" />
            ) : null}
            {r.timeline6Month?.length ? (
              <TimelineSection items={r.timeline6Month} label="6‑month plan" />
            ) : null}
            {r.timeline12Month?.length ? (
              <TimelineSection items={r.timeline12Month} label="12‑month plan" />
            ) : null}
          </div>
        </section>

        {/* Admissions Strategy Optimizer */}
        {r.admissionsStrategyOptimizer?.length ? (
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-400" />
              Admissions Strategy Optimizer
            </h2>
            <p className="text-slate-400 text-sm mb-6">
              High-impact actions tailored to each target college, ranked by impact and feasibility.
            </p>
            <div className="space-y-8">
              {r.admissionsStrategyOptimizer.map((result, idx) => (
                <OptimizerCollegeSection key={idx} result={result} />
              ))}
            </div>
          </section>
        ) : null}

        {/* College competitiveness */}
        {r.collegeCompetitiveness?.colleges?.length ? (
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-white mb-4">College competitiveness</h2>
            {r.collegeCompetitiveness.summary && (
              <p className="text-slate-400 mb-4">{r.collegeCompetitiveness.summary}</p>
            )}
            <div className="grid sm:grid-cols-2 gap-4">
              {r.collegeCompetitiveness.colleges.map((c, i) => (
                <CollegeCard key={i} c={c} />
              ))}
            </div>
          </section>
        ) : null}

        {/* Citations */}
        {r.citations?.length ? (
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-white mb-4">Research & evidence</h2>
            <div className="space-y-2">
              {r.citations.map((c, i) => (
                <CitationCard key={i} c={c} />
              ))}
            </div>
          </section>
        ) : null}

        <Link href="/">
          <Button variant="outline">Back to home</Button>
        </Link>
      </div>
    </div>
  );
}
