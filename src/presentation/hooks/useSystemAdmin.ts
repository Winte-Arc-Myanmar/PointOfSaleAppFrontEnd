"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { ISystemAdminService } from "@/core/domain/services/ISystemAdminService";
import type {
  OnboardTenantDto,
  SystemAdminCreateUserDto,
  AssignPermissionsDto,
  AssignRoleDto,
} from "@/core/application/dtos/SystemAdminDto";

function getService() {
  return container.resolve<ISystemAdminService>("systemAdminService");
}

export function useOnboardTenant() {
  return useMutation({
    mutationFn: (data: OnboardTenantDto) => getService().onboardTenant(data),
  });
}

export function useSystemAdminDeleteTenant() {
  return useMutation({
    mutationFn: (id: string) => getService().deleteTenant(id),
  });
}

export function useSystemAdminCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SystemAdminCreateUserDto) => getService().createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useAssignPermissions() {
  return useMutation({
    mutationFn: (data: AssignPermissionsDto) => getService().assignPermissions(data),
  });
}

export function useAssignRole() {
  return useMutation({
    mutationFn: (data: AssignRoleDto) => getService().assignRole(data),
  });
}
