"use client";

import { useQuery } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { ITenantService } from "@/core/domain/services/ITenantService";
import type { IRoleService } from "@/core/domain/services/IRoleService";
import { getPaginatedItems } from "./pagination";

const QUERY_KEY = ["create-role-form-options"];

export function useCreateRoleFormOptions() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const tenantService = container.resolve<ITenantService>("tenantService");
      const roleService = container.resolve<IRoleService>("roleService");

      const [tenantsResult, rolesResult] = await Promise.all([
        tenantService.getAll(),
        roleService.getAll(),
      ]);

      return {
        tenants: getPaginatedItems(tenantsResult),
        roles: getPaginatedItems(rolesResult),
      };
    },
  });
}
