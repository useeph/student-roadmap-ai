"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { TagInput } from "@/components/TagInput";
import { Disclaimer } from "@/components/Disclaimer";
import type { StudentProfileInput } from "@/types";

export default function IntakePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<StudentProfileInput>>({
    name: "",
    age: undefined,
    gradeLevel: "",
    graduationYear: undefined,
    gpa: undefined,
    currentClasses: [],
    intendedMajors: [],
    intendedIndustry: "",
    targetColleges: [],
    interests: [],
    extracurriculars: [],
    awards: [],
    leadershipExp: [],
    githubUrl: "",
    portfolioUrl: "",
    hoursPerWeek: undefined,
    constraints: "",
    goals: "",
    testScores: {},
  });

  const update = (k: keyof StudentProfileInput, v: unknown) => {
    setForm((prev) => ({ ...prev, [k]: v }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name?.trim()) {
      setError("Please enter your name.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          currentClasses: form.currentClasses ?? [],
          intendedMajors: form.intendedMajors ?? [],
          targetColleges: form.targetColleges ?? [],
          interests: form.interests ?? [],
          extracurriculars: form.extracurriculars ?? [],
          awards: form.awards ?? [],
          leadershipExp: form.leadershipExp ?? [],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save profile");
      router.push(`/roadmap/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <h1 className="text-3xl font-bold text-white mb-2">Your profile</h1>
        <p className="text-slate-400 mb-8">
          The more you share, the better your roadmap. All fields are optional except your name.
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card className="p-6 bg-slate-900/50 border-slate-800">
            <h2 className="text-lg font-semibold text-white mb-4">Basics</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name or nickname *</Label>
                <Input
                  id="name"
                  value={form.name ?? ""}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Alex"
                  required
                />
              </div>
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  min={10}
                  max={25}
                  value={form.age ?? ""}
                  onChange={(e) => update("age", e.target.value ? parseInt(e.target.value, 10) : undefined)}
                  placeholder="15"
                />
              </div>
              <div>
                <Label htmlFor="grade">Grade level</Label>
                <Input
                  id="grade"
                  value={form.gradeLevel ?? ""}
                  onChange={(e) => update("gradeLevel", e.target.value)}
                  placeholder="10th"
                />
              </div>
              <div>
                <Label htmlFor="gradYear">Graduation year</Label>
                <Input
                  id="gradYear"
                  type="number"
                  min={2024}
                  max={2035}
                  value={form.graduationYear ?? ""}
                  onChange={(e) => update("graduationYear", e.target.value ? parseInt(e.target.value, 10) : undefined)}
                  placeholder="2027"
                />
              </div>
              <div>
                <Label htmlFor="gpa">GPA (e.g., 3.8)</Label>
                <Input
                  id="gpa"
                  type="number"
                  step="0.1"
                  min={0}
                  max={4.5}
                  value={form.gpa ?? ""}
                  onChange={(e) => update("gpa", e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="3.8"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-slate-900/50 border-slate-800">
            <h2 className="text-lg font-semibold text-white mb-4">Academics</h2>
            <div className="space-y-4">
              <div>
                <Label>Current classes</Label>
                <TagInput
                  value={form.currentClasses ?? []}
                  onChange={(v) => update("currentClasses", v)}
                  placeholder="Add class, e.g. AP Calculus"
                />
              </div>
              <div>
                <Label>Intended majors</Label>
                <TagInput
                  value={form.intendedMajors ?? []}
                  onChange={(v) => update("intendedMajors", v)}
                  placeholder="Add major, e.g. Computer Science"
                />
              </div>
              <div>
                <Label htmlFor="industry">Intended industry</Label>
                <Input
                  id="industry"
                  value={form.intendedIndustry ?? ""}
                  onChange={(e) => update("intendedIndustry", e.target.value)}
                  placeholder="e.g. Technology, Medicine"
                />
              </div>
              <div>
                <Label>Target colleges</Label>
                <TagInput
                  value={form.targetColleges ?? []}
                  onChange={(v) => update("targetColleges", v)}
                  placeholder="Add college name"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-slate-900/50 border-slate-800">
            <h2 className="text-lg font-semibold text-white mb-4">Activities & achievements</h2>
            <div className="space-y-4">
              <div>
                <Label>Interests</Label>
                <TagInput
                  value={form.interests ?? []}
                  onChange={(v) => update("interests", v)}
                  placeholder="e.g. Robotics, Debate"
                />
              </div>
              <div>
                <Label>Extracurriculars</Label>
                <TagInput
                  value={form.extracurriculars ?? []}
                  onChange={(v) => update("extracurriculars", v)}
                  placeholder="e.g. Math Club, Soccer"
                />
              </div>
              <div>
                <Label>Awards</Label>
                <TagInput
                  value={form.awards ?? []}
                  onChange={(v) => update("awards", v)}
                  placeholder="e.g. Science Olympiad regional"
                />
              </div>
              <div>
                <Label>Leadership experience</Label>
                <TagInput
                  value={form.leadershipExp ?? []}
                  onChange={(v) => update("leadershipExp", v)}
                  placeholder="e.g. Club president"
                />
              </div>
              <div>
                <Label htmlFor="github">GitHub URL</Label>
                <Input
                  id="github"
                  type="url"
                  value={form.githubUrl ?? ""}
                  onChange={(e) => update("githubUrl", e.target.value)}
                  placeholder="https://github.com/username"
                />
              </div>
              <div>
                <Label htmlFor="portfolio">Portfolio URL</Label>
                <Input
                  id="portfolio"
                  type="url"
                  value={form.portfolioUrl ?? ""}
                  onChange={(e) => update("portfolioUrl", e.target.value)}
                  placeholder="https://portfolio.example.com"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-slate-900/50 border-slate-800">
            <h2 className="text-lg font-semibold text-white mb-4">Capacity & goals</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="hours">Available hours per week</Label>
                <Input
                  id="hours"
                  type="number"
                  min={0}
                  step="0.5"
                  value={form.hoursPerWeek ?? ""}
                  onChange={(e) => update("hoursPerWeek", e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="e.g. 10"
                />
              </div>
              <div>
                <Label htmlFor="constraints">Constraints (budget, location, etc.)</Label>
                <Textarea
                  id="constraints"
                  value={form.constraints ?? ""}
                  onChange={(e) => update("constraints", e.target.value)}
                  placeholder="e.g. Prefer free/local programs"
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="goals">Goals</Label>
                <Textarea
                  id="goals"
                  value={form.goals ?? ""}
                  onChange={(e) => update("goals", e.target.value)}
                  placeholder="What do you want to achieve in the next 1–2 years?"
                  rows={3}
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sat">SAT score (optional)</Label>
                  <Input
                    id="sat"
                    type="number"
                    min={400}
                    max={1600}
                    value={form.testScores?.sat ?? ""}
                    onChange={(e) => update("testScores", {
                      ...form.testScores,
                      sat: e.target.value ? parseInt(e.target.value, 10) : undefined,
                    })}
                    placeholder="e.g. 1400"
                  />
                </div>
                <div>
                  <Label htmlFor="act">ACT score (optional)</Label>
                  <Input
                    id="act"
                    type="number"
                    min={1}
                    max={36}
                    value={form.testScores?.act ?? ""}
                    onChange={(e) => update("testScores", {
                      ...form.testScores,
                      act: e.target.value ? parseInt(e.target.value, 10) : undefined,
                    })}
                    placeholder="e.g. 32"
                  />
                </div>
              </div>
            </div>
          </Card>

          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Generating roadmap...
                </>
              ) : (
                "Generate my roadmap"
              )}
            </Button>
          </div>
        </form>

        <Disclaimer className="mt-12" />
      </div>
    </div>
  );
}
