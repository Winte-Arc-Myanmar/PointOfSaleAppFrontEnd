"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { ITenantService } from "@/core/domain/services/ITenantService";
import type { TenantDto } from "@/core/application/dtos/TenantDto";

const TENANTS_QUERY_KEY = ["tenants"];

export function useTenants() {
  return useQuery({
    queryKey: TENANTS_QUERY_KEY,
    queryFn: () => {
      const tenantService = container.resolve<ITenantService>("tenantService");
      return tenantService.getAll();
    },
  });
}

export function useTenant(id: string | null) {
  return useQuery({
    queryKey: [...TENANTS_QUERY_KEY, id],
    queryFn: () => {
      const tenantService = container.resolve<ITenantService>("tenantService");
      return tenantService.getById(id!);
    },
    enabled: !!id,
  });
}

export function useCreateTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<TenantDto, "id">) => {
      const tenantService = container.resolve<ITenantService>("tenantService");
      return tenantService.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TENANTS_QUERY_KEY });
    },
  });
}

export function useUpdateTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<TenantDto, "id"> }) => {
      const tenantService = container.resolve<ITenantService>("tenantService");
      return tenantService.update(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: TENANTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...TENANTS_QUERY_KEY, variables.id] });
    },
  });
}

export function useDeleteTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      const tenantService = container.resolve<ITenantService>("tenantService");
      return tenantService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TENANTS_QUERY_KEY });
    },
  });
}
