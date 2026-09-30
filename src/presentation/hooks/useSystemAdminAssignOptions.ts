"use client";

import { useQuery } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { IRoleService } from "@/core/domain/services/IRoleService";
import type { IPermissionService } from "@/core/domain/services/IPermissionService";
import type { IUserService } from "@/core/domain/services/IUserService";
import type { IBranchService } from "@/core/domain/services/IBranchService";
import type { ITenantService } from "@/core/domain/services/ITenantService";
import { getPaginatedItems } from "./pagination";

// A system admin sees every tenant's roles, far more than one page.
const ALL = { page: 1, limit: 500 };

export function useAssignPermissionsOptions() {
  return useQuery({
    queryKey: ["system-admin", "assign-permissions-options"],
    queryFn: async () => {
      const roleService = container.resolve<IRoleService>("roleService");
      const permissionService =
        container.resolve<IPermissionService>("permissionService");

      const tenantService = container.resolve<ITenantService>("tenantService");

      const [rolesResult, permissionsResult, tenantsResult] = await Promise.all([
        roleService.getAll(ALL),
        permissionService.getAll(),
        tenantService.getAll(ALL),
      ]);

      return {
        roles: getPaginatedItems(rolesResult),
        permissions: getPaginatedItems(permissionsResult),
        tenants: getPaginatedItems(tenantsResult),
      };
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

      const [usersResult, rolesResult, tenantsResult, branchesResult] = await Promise.all([
        userService.getAll(),
        roleService.getAll(),
        tenantService.getAll(),
        branchService.getAll(),
      ]);

      return {
        users: getPaginatedItems(usersResult),
        roles: getPaginatedItems(rolesResult),
        tenants: getPaginatedItems(tenantsResult),
        branches: getPaginatedItems(branchesResult),
      };
    },
  });
}

