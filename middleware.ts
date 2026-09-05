import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { GUEST_ONLY_BETA } from "@/lib/beta";

export async function middleware(request: NextRequest) {
  if (GUEST_ONLY_BETA) {
    // /studio was redirected away while it was a placeholder of six sample
    // panels. It is now a working portfolio workspace that saves in the
    // browser and needs no account, so the guest-only beta includes it.
    if (
      request.nextUrl.pathname === "/login" ||
      request.nextUrl.pathname === "/signup" ||
      request.nextUrl.pathname === "/forgot-password" ||
      request.nextUrl.pathname.startsWith("/auth/")
    ) {
      return NextResponse.redirect(new URL("/courses", request.url));
    }
    return NextResponse.next();
  }
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
