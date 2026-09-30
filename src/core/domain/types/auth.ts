/**
 * Auth-related types.
 * Domain layer - no framework dependencies.
 */

export type UserType = "user" | "systemAdmin";

export interface BranchAccess {
  branchId: string;
  roles: string[];
  permissions: string[];
}

export interface LoginCredentials {
  /** A system admin's email, or a user's User ID (e.g. SHW0001). */
  login: string;
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
