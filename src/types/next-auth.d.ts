import "next-auth";
import type { UserType } from "@/core/domain/types/auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
  }
  interface User {
    accessToken?: string;
    type?: UserType;
    tenantId?: string;
    branchId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    type?: UserType;
    tenantId?: string;
    branchId?: string | null;
  }
}
