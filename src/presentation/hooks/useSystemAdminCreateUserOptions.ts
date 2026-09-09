"use client";

import { useQuery } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { IRoleService } from "@/core/domain/services/IRoleService";
import type { IBranchService } from "@/core/domain/services/IBranchService";
import type { ITenantService } from "@/core/domain/services/ITenantService";
import { getPaginatedItems } from "./pagination";

const OPTIONS_QUERY_KEY = ["system-admin", "create-user-options"];

export function useSystemAdminCreateUserOptions() {
  return useQuery({
    queryKey: OPTIONS_QUERY_KEY,
    queryFn: async () => {
      const roleService = container.resolve<IRoleService>("roleService");
      const branchService = container.resolve<IBranchService>("branchService");
      const tenantService = container.resolve<ITenantService>("tenantService");

      const rolesResult = await roleService.getAll();
      const rolePageCount = Math.ceil(rolesResult.total / rolesResult.limit);
      const remainingRolePages = await Promise.all(
        Array.from({ length: rolePageCount - 1 }, (_, index) =>
          roleService.getAll({ page: index + 2, limit: rolesResult.limit })
        )
      );
      const [branchesResult, tenantsResult] = await Promise.all([
        branchService.getAll(),
        tenantService.getAll(),
      ]);

      return {
        roles: [
          ...getPaginatedItems(rolesResult),
          ...remainingRolePages.flatMap(getPaginatedItems),
        ],
        branches: getPaginatedItems(branchesResult),
        tenants: getPaginatedItems(tenantsResult),
      };
    },
  });
}

