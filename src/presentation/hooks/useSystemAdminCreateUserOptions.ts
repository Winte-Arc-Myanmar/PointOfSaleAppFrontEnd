"use client";

import { useQuery } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { IRoleService } from "@/core/domain/services/IRoleService";
import type { IBranchService } from "@/core/domain/services/IBranchService";
import type { ITenantService } from "@/core/domain/services/ITenantService";

const OPTIONS_QUERY_KEY = ["system-admin", "create-user-options"];

export function useSystemAdminCreateUserOptions() {
  return useQuery({
    queryKey: OPTIONS_QUERY_KEY,
    queryFn: async () => {
      const roleService = container.resolve<IRoleService>("roleService");
      const branchService = container.resolve<IBranchService>("branchService");
      const tenantService = container.resolve<ITenantService>("tenantService");

      const [roles, branches, tenants] = await Promise.all([
        roleService.getAll(),
        branchService.getAll(),
        tenantService.getAll(),
      ]);

      return { roles, branches, tenants };
    },
  });
}

