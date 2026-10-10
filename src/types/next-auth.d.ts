import "next-auth";
import type { UserType, BranchAccess } from "@/core/domain/types/auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    activeBranch?: string;
    access?: BranchAccess[];
    /** When the API access token runs out (ms); renewed before then while possible. */
    expiresAt?: number | null;
  }
  interface User {
    accessToken?: string;
    refreshToken?: string;
    type?: UserType;
    tenantId?: string;
    activeBranch?: string;
    access?: BranchAccess[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    /** Never sent to the browser: only the jwt callback reads it. */
    refreshToken?: string;
    type?: UserType;
    tenantId?: string;
    activeBranch?: string;
    access?: BranchAccess[];
  }
}
