"use client";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  if (typeof window != "undefined") {
    const currentUserInStorage = localStorage.getItem("currentUser");
    if (currentUserInStorage) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.redirect(new URL("/auth", request.url));
  }
}

export const config = {
  matcher: "/",
};
