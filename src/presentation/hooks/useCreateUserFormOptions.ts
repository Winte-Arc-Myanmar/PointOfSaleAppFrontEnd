"use client";

import { useQuery } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { IRoleService } from "@/core/domain/services/IRoleService";
import type { IBranchService } from "@/core/domain/services/IBranchService";
import { getPaginatedItems } from "./pagination";

const QUERY_KEY = ["create-user-form-options"];
// A system admin sees every tenant's roles and branches, far more than one page.
const ALL = { page: 1, limit: 500 };

export function useCreateUserFormOptions() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const roleService = container.resolve<IRoleService>("roleService");
      const branchService = container.resolve<IBranchService>("branchService");

      const [rolesResult, branchesResult] = await Promise.all([
        roleService.getAll(ALL),
        branchService.getAll(ALL),
      ]);

      return {
        roles: getPaginatedItems(rolesResult),
        branches: getPaginatedItems(branchesResult),
      };
    },
  });
}
