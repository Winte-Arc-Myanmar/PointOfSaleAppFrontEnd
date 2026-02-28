/**
 * Authenticated user entity.
 * Domain layer - no framework dependencies.
 */

import type { UserType } from "@/core/domain/types/auth";

export interface AuthUser {
  id?: string;
  email: string;
  name?: string | null;
  image?: string | null;
  accessToken?: string;
  type?: UserType;
  tenantId?: string;
  branchId?: string | null;
}
