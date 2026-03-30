"use client";

import { useQuery } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { IRoleService } from "@/core/domain/services/IRoleService";
import type { IBranchService } from "@/core/domain/services/IBranchService";

const QUERY_KEY = ["create-user-form-options"];

export function useCreateUserFormOptions() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const roleService = container.resolve<IRoleService>("roleService");
      const branchService = container.resolve<IBranchService>("branchService");

      const [roles, branches] = await Promise.all([
        roleService.getAll(),
        branchService.getAll(),
      ]);

      return { roles, branches };
    },
  });
}
