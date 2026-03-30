"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { IRoleService } from "@/core/domain/services/IRoleService";
import type { Role } from "@/core/domain/entities/Role";
import type { CreateRoleDto } from "@/core/application/dtos/RoleDto";

const ROLES_QUERY_KEY = ["roles"];

function getService() {
  return container.resolve<IRoleService>("roleService");
}

export function useRoles() {
  return useQuery({
    queryKey: ROLES_QUERY_KEY,
    queryFn: () => getService().getAll(),
  });
}

export function useRole(id: string | null) {
  return useQuery({
    queryKey: [...ROLES_QUERY_KEY, id],
    queryFn: () => getService().getById(id!),
    enabled: !!id,
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRoleDto) => getService().create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY });
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => getService().delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY });
    },
  });
}

export function useAssignRolePermissions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      roleId,
      permissionIds,
    }: {
      roleId: string;
      permissionIds: string[];
    }) => getService().assignPermissions(roleId, permissionIds),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: [...ROLES_QUERY_KEY, vars.roleId] });
    },
  });
}

