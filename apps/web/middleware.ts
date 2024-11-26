import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const authRoutes = ["/auth/login", "/auth/sign-up"];
const dashBoard = "/dashboard"; // Change this in the future.
const publicRoutes = ["/about", "/contact", "/blog"];

export default withAuth(
  function middleware(req) {
    const isAuthenticated = !!req.nextauth.token;
    const isAuthPage = authRoutes.includes(req.nextUrl.pathname);
    const isPublicRoute = publicRoutes.includes(req.nextUrl.pathname);
    const isProfilePage = req.nextUrl.pathname === dashBoard;
    const hasCompletedProfile = !!req.nextauth.token?.name;

    // Trying to access auth pages while logged in
    if (isAuthenticated && isAuthPage) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Not logged in trying to access protected routes
    if (!isAuthenticated && !isAuthPage && !isPublicRoute && !req.nextUrl.pathname.startsWith("/play")) {
      return NextResponse.redirect(
        new URL("/auth/login?callbackUrl=" + encodeURIComponent(req.url), req.url)
      );
    }

    // Logged in but profile not complete
    if (isAuthenticated && !hasCompletedProfile && !isProfilePage && !isAuthPage) {
      return NextResponse.redirect(new URL(dashBoard, req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        return true; // Let the middleware function handle the auth logic
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|).*)",
  ],
};
