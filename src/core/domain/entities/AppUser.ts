/**
 * User entity (CRUD resource from /v1/users).
 * Domain layer - no framework dependencies.
 */

import type { Id } from "@/core/domain/types";

export interface AppUser {
  id: Id;
  email: string;
  username: string;
  fullName: string;
  phoneNumber?: string;
  avatarUrl?: string;
  jobTitle?: string;
  roleId?: string;
  branchId?: string;
  preferredLanguage?: string;
  status?: string;
  lastLoginAt?: string | null;
  loginAttempts?: number;
  lockoutUntil?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt?: string;
  updatedAt?: string;
}
