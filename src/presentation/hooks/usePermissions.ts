"use client";

import { useSession } from "next-auth/react";
import type { UserType, BranchAccess } from "@/core/domain/types/auth";
import {
  hasPermissions,
  hasAnyPermission,
  hasRole,
} from "@/core/domain/services/permissions";

export function usePermissions() {
  const { data: session } = useSession();

  const userType = (session?.user as { type?: UserType } | undefined)?.type;
  const access = session?.access as BranchAccess[] | undefined;
  const activeBranch = session?.activeBranch as string | undefined;
  const tenantId = (session?.user as { tenantId?: string } | undefined)?.tenantId;
  const isSystemAdmin = userType === "systemAdmin";

  return {
    userType,
    tenantId,
    activeBranch,
    access,
    isSystemAdmin,
    /** True if user has ALL listed permissions (systemAdmin always true). */
    can: (...permissions: string[]) =>
      hasPermissions(userType, access, activeBranch, permissions),
    /** True if user has at least ONE listed permission. */
    canAny: (...permissions: string[]) =>
      hasAnyPermission(userType, access, activeBranch, permissions),
    /** True if user has at least ONE listed role on active branch. */
    hasRole: (...roles: string[]) =>
      hasRole(userType, access, activeBranch, roles),
  };
}
