/**
 * Middleware - protects dashboard routes.
 * Redirects unauthenticated users to login.
 * Redirects logged-in users away from /login only (not from /products).
 */

import { auth } from "@/server/auth";

const publicPaths = ["/login", "/products"];

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const pathname = req.nextUrl.pathname;
  const isPublic = publicPaths.some((p) => pathname.startsWith(p));

  if (!isLoggedIn && !isPublic) {
    return Response.redirect(new URL("/login", req.nextUrl));
  }
  if (isLoggedIn && pathname.startsWith("/login")) {
    return Response.redirect(new URL("/products", req.nextUrl));
  }
  return undefined;
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
