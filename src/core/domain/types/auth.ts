/**
 * Auth-related types.
 * Domain layer - no framework dependencies.
 */

export type UserType = "user" | "systemAdmin";

export interface LoginCredentials {
  email: string;
  password: string;
  type: UserType;
  tenantId?: string;
  branchId?: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}
