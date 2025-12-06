import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  // Skip middleware for public routes
  if (request?.nextUrl?.pathname?.endsWith("/students/result")) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;

  // If there's no token and the user is trying to access a protected route
  if (!token && !request?.nextUrl.pathname.endsWith("/login") && !request?.nextUrl.pathname.endsWith("/student/login")) {
    console.log("No token, redirecting to login");
    // If trying to access student area, redirect to student login
    if (request?.nextUrl.pathname.startsWith("/student")) {
      return NextResponse.redirect(new URL("/student/login", request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If there's a token and the user is trying to access the login page
  if (token && (request?.nextUrl?.pathname?.startsWith("/login") || request?.nextUrl?.pathname?.startsWith("/student/login"))) {
    console.log("Token found, redirecting to home");
    return NextResponse.redirect(new URL("/", request.url));
  }
  
  // If there's a token, verify it
  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      // console.log(payload);
      if (!payload.role) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
      if (request?.nextUrl.pathname === "/") {
        return NextResponse.redirect(
          new URL(`${payload.role}/dashboard`, request.url)
        );
      }

      return NextResponse.next();
    } catch (error) {
      // If token is invalid, redirect to login
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
