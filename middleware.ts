import { NextResponse } from "next/server"
import NextAuth from "next-auth"

import { authConfig } from "@/auth.config"

const { auth } = NextAuth(authConfig)

const protectedExact = new Set(["/feed", "/notifications", "/settings"])

export default auth((req) => {
  const path = req.nextUrl.pathname
  const isProtected =
    protectedExact.has(path) || path.startsWith("/u/") || path.startsWith("/post/")
  if (!isProtected) return NextResponse.next()
  if (!req.auth) {
    const url = new URL("/sign-in", req.nextUrl.origin)
    url.searchParams.set("callbackUrl", path)
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
})

export const config = {
  matcher: ["/feed", "/notifications", "/settings", "/u/:path*", "/post/:path*"],
}
