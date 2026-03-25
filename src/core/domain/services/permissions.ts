/**
 * Permission helpers - pure functions, no framework dependencies.
 * systemAdmin bypasses all checks. Regular users are gated by their active branch's permissions.
 */

import type { UserType, BranchAccess } from "@/core/domain/types/auth";

/** Returns the access entry for the user's active branch. */
export function getActiveBranchAccess(
  access: BranchAccess[] | undefined,
  activeBranch: string | undefined
): BranchAccess | undefined {
  if (!access || !activeBranch) return undefined;
  return access.find((a) => a.branchId === activeBranch);
}

/** True if the user has ALL of the listed permissions (systemAdmin always passes). */
export function hasPermissions(
  userType: UserType | undefined,
  access: BranchAccess[] | undefined,
  activeBranch: string | undefined,
  required: string[]
): boolean {
  if (userType === "systemAdmin") return true;
  if (required.length === 0) return true;
  const entry = getActiveBranchAccess(access, activeBranch);
  if (!entry) return false;
  return required.every((p) => entry.permissions.includes(p));
}

/** True if the user has at least ONE of the listed permissions. */
export function hasAnyPermission(
  userType: UserType | undefined,
  access: BranchAccess[] | undefined,
  activeBranch: string | undefined,
  required: string[]
): boolean {
  if (userType === "systemAdmin") return true;
  if (required.length === 0) return true;
  const entry = getActiveBranchAccess(access, activeBranch);
  if (!entry) return false;
  return required.some((p) => entry.permissions.includes(p));
}

/** True if the user has at least ONE of the listed roles on their active branch. */
export function hasRole(
  userType: UserType | undefined,
  access: BranchAccess[] | undefined,
  activeBranch: string | undefined,
  roles: string[]
): boolean {
  if (userType === "systemAdmin") return true;
  if (roles.length === 0) return true;
  const entry = getActiveBranchAccess(access, activeBranch);
  if (!entry) return false;
  return roles.some((r) => entry.roles.includes(r));
}
