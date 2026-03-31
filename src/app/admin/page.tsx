import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { SignOutButton } from "@/components/auth/SignOutButton";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <header className="flex items-center justify-between mb-10">
          <Link href="/" className="flex items-center gap-2 text-white">
            <GraduationCap className="h-8 w-8 text-indigo-400" />
            <span className="font-bold">Admin</span>
          </Link>
          <SignOutButton />
        </header>
        <h1 className="text-2xl font-bold text-white mb-4">Administrator</h1>
        <p className="text-slate-400">
          This area is restricted to admin users. Add admin tools here as needed.
        </p>
      </div>
    </div>
  );
}
