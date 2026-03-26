/**
 * Auth service interface.
 * Domain layer - auth operations (login + register). Used by auth.ts and UI.
 */

import type { AuthUser } from "@/core/domain/entities/User";
import type { LoginCredentials, RegisterData } from "@/core/domain/types/auth";

export type { UserType, BranchAccess } from "@/core/domain/types/auth";
export type { LoginCredentials, RegisterData } from "@/core/domain/types/auth";
export type { AuthUser } from "@/core/domain/entities/User";

export interface IAuthService {
  login(credentials: LoginCredentials): Promise<AuthUser | null>;
  register(data: RegisterData): Promise<void>;
}
