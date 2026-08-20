import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { TOKEN_COOKIE } from "@/lib/cookies";

const PROTECTED = ["/drive", "/starred", "/trash"];
const AUTH_PAGES = ["/login", "/register"];

export function proxy(request: NextRequest) {
  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  const { pathname } = request.nextUrl;

  if (pathname === "/") {
    return NextResponse.redirect(new URL(token ? "/drive" : "/login", request.url));
  }

  if (AUTH_PAGES.some((p) => pathname.startsWith(p))) {
    if (token) {
      return NextResponse.redirect(new URL("/drive", request.url));
    }
    return NextResponse.next();
  }

  if (PROTECTED.some((p) => pathname.startsWith(p))) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login/:path*",
    "/register/:path*",
    "/drive/:path*",
    "/starred/:path*",
    "/trash/:path*",
  ],
};
