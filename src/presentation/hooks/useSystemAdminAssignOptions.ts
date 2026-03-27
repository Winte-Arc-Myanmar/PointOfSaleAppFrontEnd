"use client";

import { useQuery } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { IRoleService } from "@/core/domain/services/IRoleService";
import type { IPermissionService } from "@/core/domain/services/IPermissionService";
import type { IUserService } from "@/core/domain/services/IUserService";
import type { IBranchService } from "@/core/domain/services/IBranchService";
import type { ITenantService } from "@/core/domain/services/ITenantService";

export function useAssignPermissionsOptions() {
  return useQuery({
    queryKey: ["system-admin", "assign-permissions-options"],
    queryFn: async () => {
      const roleService = container.resolve<IRoleService>("roleService");
      const permissionService =
        container.resolve<IPermissionService>("permissionService");

      const [roles, permissions] = await Promise.all([
        roleService.getAll(),
        permissionService.getAll(),
      ]);

      return { roles, permissions };
    },
  });
}

export function useAssignRoleOptions() {
  return useQuery({
    queryKey: ["system-admin", "assign-role-options"],
    queryFn: async () => {
      const userService = container.resolve<IUserService>("userService");
      const roleService = container.resolve<IRoleService>("roleService");
      const tenantService = container.resolve<ITenantService>("tenantService");
      const branchService = container.resolve<IBranchService>("branchService");

      const [users, roles, tenants, branches] = await Promise.all([
        userService.getAll(),
        roleService.getAll(),
        tenantService.getAll(),
        branchService.getAll(),
      ]);

      return { users, roles, tenants, branches };
    },
  });
}

