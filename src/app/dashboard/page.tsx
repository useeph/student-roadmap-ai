import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { GraduationCap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SignOutButton } from "@/components/auth/SignOutButton";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
    include: { roadmap: true },
  });

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <header className="flex items-center justify-between mb-10">
          <Link href="/" className="flex items-center gap-2 text-white">
            <GraduationCap className="h-8 w-8 text-indigo-400" />
            <span className="font-bold">Dashboard</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-slate-400 text-sm hidden sm:inline truncate max-w-[200px]">
              {session.user.email}
            </span>
            <SignOutButton />
          </div>
        </header>

        <h1 className="text-2xl font-bold text-white mb-2">Welcome back</h1>
        <p className="text-slate-400 mb-8">
          Manage your profile and view your admissions roadmap.
        </p>

        {!profile ? (
          <Card className="p-6 bg-slate-900/50 border-slate-800">
            <p className="text-slate-300 mb-4">No profile found. Complete your intake to generate a roadmap.</p>
            <Link href="/intake">
              <Button className="gap-2">
                Start intake
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            <Card className="p-6 bg-slate-900/50 border-slate-800">
              <h2 className="text-lg font-semibold text-white mb-1">{profile.name}</h2>
              <p className="text-slate-400 text-sm mb-4">
                {profile.gradeLevel && `${profile.gradeLevel}`}
                {profile.graduationYear && ` • Class of ${profile.graduationYear}`}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/intake">
                  <Button variant="outline" size="sm">
                    Edit profile
                  </Button>
                </Link>
                {profile.roadmap ? (
                  <Link href={`/roadmap/${profile.id}`}>
                    <Button className="gap-2">
                      View roadmap
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <Link href={`/roadmap/${profile.id}`}>
                    <Button className="gap-2">
                      Generate roadmap
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
