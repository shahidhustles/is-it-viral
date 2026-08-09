import {
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

const isPrivateRoute = createRouteMatcher([
  "/onboarding(.*)",
  "/post-sign-in(.*)",
  "/dashboard(.*)",
  "/analyze(.*)",
]);

const isAuthenticationRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

export async function protectPrivateRoutes(
  auth: { protect: () => Promise<unknown>; (): Promise<{ userId: string | null }> },
  request: NextRequest,
) {
  const { userId } = await auth();
  if (userId && isAuthenticationRoute(request)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isPrivateRoute(request)) {
    await auth.protect();
  }
}

export default clerkMiddleware(protectPrivateRoutes);

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
    // Always run for Clerk-specific frontend API routes
    '/__clerk/(.*)',
  ],
}
