/**
 * Middleware - protects dashboard routes.
 * systemAdmin has full access. Regular users are gated by per-branch permissions.
 * /admin/* routes are system-admin only.
 */

import { auth } from "@/server/auth";
import type { UserType, BranchAccess } from "@/core/domain/types/auth";

const publicPaths = ["/login", "/register"];

interface RoutePermission {
  prefix: string;
  permissions: string[];
}

const permissionRoutes: RoutePermission[] = [
  { prefix: "/tenants", permissions: ["tenants:read"] },
  { prefix: "/users", permissions: ["users:read"] },
  { prefix: "/roles", permissions: ["roles:read"] },
  { prefix: "/categories", permissions: ["categories:read"] },
  { prefix: "/branches", permissions: ["branches:read"] },
  { prefix: "/uom", permissions: ["uom:read"] },
  { prefix: "/products", permissions: ["products:read"] },
];

function checkPermission(
  userType: UserType | undefined,
  access: BranchAccess[] | undefined,
  activeBranch: string | undefined,
  required: string[]
): boolean {
  if (userType === "systemAdmin") return true;
  if (required.length === 0) return true;
  if (!access || !activeBranch) return false;
  const entry = access.find((a) => a.branchId === activeBranch);
  if (!entry) return false;
  return required.some((p) => entry.permissions.includes(p));
}

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

  if (isLoggedIn && req.auth) {
    const userType = (req.auth.user as { type?: UserType } | undefined)?.type;
    const activeBranch = req.auth.activeBranch;
    const access = req.auth.access;

    if (pathname.startsWith("/admin")) {
      if (userType !== "systemAdmin") {
        return Response.redirect(new URL("/products", req.nextUrl));
      }
      return undefined;
    }

    for (const route of permissionRoutes) {
      if (pathname.startsWith(route.prefix)) {
        if (!checkPermission(userType, access, activeBranch, route.permissions)) {
          return Response.redirect(new URL("/products", req.nextUrl));
        }
        break;
      }
    }
  }

  return undefined;
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|logo\\.svg).*)"],
};
