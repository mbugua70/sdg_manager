import { NextRequest, NextResponse } from "next/server";
import { TOKEN_COOKIE_NAME, USER_COOKIE_NAME, ADMIN_USER_ID } from "./lib/constants";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicRoute = pathname === "/login" || pathname.startsWith("/api/auth/login");
  const isApiRoute = pathname.startsWith("/api/");

  const token = request.cookies.get(TOKEN_COOKIE_NAME)?.value;
  const userRaw = request.cookies.get(USER_COOKIE_NAME)?.value;

  let isAuthenticated = false;
  if (token && userRaw) {
    try {
      const user = JSON.parse(userRaw);
      isAuthenticated = user.id === ADMIN_USER_ID;
    } catch {
      isAuthenticated = false;
    }
  }

  if (isPublicRoute) {
    if (isAuthenticated && pathname === "/login") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (!isAuthenticated) {
    if (isApiRoute) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
