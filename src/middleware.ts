import { auth } from "@/auth";
import { safeCallbackUrl } from "@/lib/safe-callback-url";
import { NextResponse } from "next/server";

const PROTECTED_PREFIXES = ["/intake", "/dashboard", "/roadmap"];
const ADMIN_PREFIX = "/admin";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  if (pathname === "/login" || pathname.startsWith("/login/")) {
    if (isLoggedIn) {
      const raw = req.nextUrl.searchParams.get("callbackUrl");
      const dest = safeCallbackUrl(raw);
      return NextResponse.redirect(new URL(dest, req.nextUrl.origin));
    }
    return NextResponse.next();
  }

  if (pathname === "/signup" || pathname.startsWith("/signup/")) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith(ADMIN_PREFIX)) {
    if (!isLoggedIn) {
      const login = new URL("/login", req.nextUrl.origin);
      login.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(login);
    }
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
    }
    return NextResponse.next();
  }

  const needsAuth = PROTECTED_PREFIXES.some((p) =>
    pathname === p || pathname.startsWith(`${p}/`)
  );
  if (needsAuth && !isLoggedIn) {
    const login = new URL("/login", req.nextUrl.origin);
    login.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/login",
    "/login/:path*",
    "/signup",
    "/signup/:path*",
    "/intake",
    "/intake/:path*",
    "/dashboard",
    "/dashboard/:path*",
    "/roadmap",
    "/roadmap/:path*",
    "/admin",
    "/admin/:path*",
  ],
};
