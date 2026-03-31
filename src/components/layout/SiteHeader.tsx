"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { signOut } from "next-auth/react";

export function SiteHeader() {
  const { data: session, status } = useSession();

  return (
    <header className="flex items-center justify-between mb-16">
      <Link href="/" className="flex items-center gap-2">
        <GraduationCap className="h-8 w-8 text-indigo-400" />
        <span className="text-xl font-bold text-white">Student Roadmap AI</span>
      </Link>
      <nav className="flex items-center gap-2 sm:gap-4">
        {status === "loading" ? (
          <span className="text-slate-500 text-sm">...</span>
        ) : session ? (
          <>
            <Link
              href="/dashboard"
              className="text-slate-300 hover:text-white transition-colors text-sm font-medium"
            >
              Dashboard
            </Link>
            {session.user?.role === "ADMIN" && (
              <Link
                href="/admin"
                className="text-amber-400/90 hover:text-amber-300 transition-colors text-sm font-medium"
              >
                Admin
              </Link>
            )}
            <Link
              href="/intake"
              className="text-slate-400 hover:text-white transition-colors text-sm font-medium hidden sm:inline"
            >
              Profile
            </Link>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Log out
            </Button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="text-slate-400 hover:text-white transition-colors text-sm font-medium"
            >
              Log in
            </Link>
            <Link href="/signup">
              <Button size="sm">Sign up</Button>
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
