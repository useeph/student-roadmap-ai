"use client";

import Link from "next/link";
import { ArrowRight, GraduationCap, Sparkles, Target } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Disclaimer } from "@/components/Disclaimer";
import { SiteHeader } from "@/components/layout/SiteHeader";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950/30 to-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.15),transparent)]" />
      <div className="relative container mx-auto px-4 py-16 md:py-24">
        <SiteHeader />

        <main className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm mb-8">
            <Sparkles className="h-4 w-4" />
            Personal roadmap for middle & high school students
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-6">
            Your path to college,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
              intelligently designed
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-12">
            Enter your profile once. Get a tailored analysis with strengths, gaps, recommended
            activities, timelines, and college competitiveness estimates—all grounded in research.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            <Link href="/signup">
              <Button size="lg" className="gap-2">
                Create your roadmap
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="gap-2">
                Sign in
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6 text-left mb-20">
            <Card className="bg-white/5 border-white/10 p-6">
              <Target className="h-10 w-10 text-indigo-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Strengths & Gaps</h3>
              <p className="text-slate-400 text-sm">
                Understand where you shine and where strategic growth can help most.
              </p>
            </Card>
            <Card className="bg-white/5 border-white/10 p-6">
              <GraduationCap className="h-10 w-10 text-indigo-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Tailored Recommendations</h3>
              <p className="text-slate-400 text-sm">
                Extracurriculars, projects, competitions, internships—prioritized for you.
              </p>
            </Card>
            <Card className="bg-white/5 border-white/10 p-6">
              <Sparkles className="h-10 w-10 text-indigo-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">3 / 6 / 12-Month Plans</h3>
              <p className="text-slate-400 text-sm">
                Actionable timelines to build your profile systematically.
              </p>
            </Card>
          </div>

          <Disclaimer />
        </main>
      </div>
    </div>
  );
}
