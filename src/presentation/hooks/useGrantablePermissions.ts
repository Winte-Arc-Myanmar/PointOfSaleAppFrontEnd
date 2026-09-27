"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { IRoleService } from "@/core/domain/services/IRoleService";
import type { ISystemAdminService } from "@/core/domain/services/ISystemAdminService";
import { usePermissions } from "./usePermissions";

/**
 * Which permissions a tenant's roles may be given: only those of the modules the
 * tenant has enabled. The API refuses the whole request if any other is sent.
 * Returns null until known.
 */
export function useGrantablePermissions(tenantId: string | null | undefined) {
  const { isSystemAdmin } = usePermissions();

  const modules = useQuery({
    queryKey: ["system-admin", "tenant-modules", tenantId],
    queryFn: () =>
      container
        .resolve<ISystemAdminService>("systemAdminService")
        .getTenantModules(tenantId!),
    enabled: isSystemAdmin && Boolean(tenantId),
  });

  const available = useQuery({
    queryKey: ["roles", "available-permissions"],
    queryFn: () =>
      container.resolve<IRoleService>("roleService").getAvailablePermissionIds(),
    enabled: !isSystemAdmin && Boolean(tenantId),
  });

  const moduleList = modules.data;
  const idList = available.data;
  return useMemo(() => {
    if (isSystemAdmin) {
      if (!moduleList) return null;
      const enabled = new Set(moduleList);
      return (permission: { id: string; module: string }) =>
        enabled.has(permission.module);
    }
    if (!idList) return null;
    const ids = new Set(idList);
    return (permission: { id: string; module: string }) => ids.has(permission.id);
  }, [idList, isSystemAdmin, moduleList]);
}
