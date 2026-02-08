import { NextResponse } from "next/server";
import { CLIENT_ROLE } from "./constants/roles";

const USER_COOKIE = "userInfo";

const parseUserFromRequest = (request) => {
  const raw = request.cookies.get(USER_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
};

export function middleware(request) {
  const userInfo = parseUserFromRequest(request);
  const hasValidRole =
    !userInfo?.role || userInfo.role === CLIENT_ROLE;

  if (!userInfo?.token || !hasValidRole) {
    const loginUrl = new URL(`/auth/login`, request.url);
    if (request.nextUrl.pathname) {
      loginUrl.searchParams.set("redirectUrl", request.nextUrl.pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    "/user/:path*",
    "/order/:path*",
    "/checkout/:path*",
    // "/auth/login/:path*",
  ],
};
