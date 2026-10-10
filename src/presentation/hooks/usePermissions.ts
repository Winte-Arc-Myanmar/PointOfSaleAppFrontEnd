"use client";

import { useSession } from "next-auth/react";
import { useActingTenant } from "@/presentation/hooks/useActingTenant";
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
  const isSystemAdmin = userType === "systemAdmin";
  const actingTenantId = useActingTenant();
  /** The shop being worked in: the user's own, or the one a system admin picked in the header. */
  const tenantId =
    (session?.user as { tenantId?: string } | undefined)?.tenantId ??
    (isSystemAdmin ? actingTenantId ?? undefined : undefined);

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
