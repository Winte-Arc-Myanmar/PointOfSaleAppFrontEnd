/**
 * Middleware - protects dashboard routes.
 * Redirects unauthenticated users to login.
 * /admin/tenants is only allowed for system_admin; others redirect to /products.
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
  if (
    isLoggedIn &&
    (pathname.startsWith("/admin/tenants") ||
      pathname.startsWith("/admin/users") ||
      pathname.startsWith("/admin/categories") ||
      pathname.startsWith("/admin/branches") ||
      pathname.startsWith("/admin/uom"))
  ) {
    const userType = (req.auth?.user as { type?: string } | undefined)?.type;
    if (userType !== "systemAdmin") {
      return Response.redirect(new URL("/products", req.nextUrl));
    }
  }
  return undefined;
});

export const config = {
  // Don't run auth middleware for static assets (e.g. logo) so they load on login page
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|logo\\.svg).*)"],
};
