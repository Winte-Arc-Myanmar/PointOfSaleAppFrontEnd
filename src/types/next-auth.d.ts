import "next-auth";
import type { UserType, BranchAccess } from "@/core/domain/types/auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    activeBranch?: string;
    access?: BranchAccess[];
  }
  interface User {
    accessToken?: string;
    type?: UserType;
    tenantId?: string;
    activeBranch?: string;
    access?: BranchAccess[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    type?: UserType;
    tenantId?: string;
    activeBranch?: string;
    access?: BranchAccess[];
  }
}
