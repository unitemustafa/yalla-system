import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { authCookieName, readSessionToken } from "@/lib/auth";

const protectedPrefixes = [
  "/account",
  "/customers",
  "/dashboard",
  "/delivery",
  "/delivery-zone",
  "/items",
  "/notifications",
  "/offers",
  "/orders",
];

function isProtectedPath(pathname: string) {
  return protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function safeNextPath(request: NextRequest) {
  return `${request.nextUrl.pathname}${request.nextUrl.search}`;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = readSessionToken(request.cookies.get(authCookieName)?.value);

  if (pathname === "/login" && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!isProtectedPath(pathname) || session) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", safeNextPath(request));

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|ico|ttf|woff|woff2)$).*)",
  ],
};
