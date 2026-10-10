"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { HttpClient } from "@/core/infrastructure/api/HttpClient";
import { API_ENDPOINTS } from "@/core/infrastructure/api/constants";

export interface TenantResetPart {
  key: string;
  label: string;
  description: string;
  requires: string[];
  rows: number;
}

export interface TenantResetPreview {
  tenant: { id: string; name: string };
  parts: TenantResetPart[];
}

const http = () => container.resolve<HttpClient>("httpClient");
const KEY = (tenantId: string) => ["tenants", tenantId, "reset"];

export function useTenantResetPreview(tenantId: string, enabled: boolean) {
  return useQuery({
    queryKey: KEY(tenantId),
    queryFn: () => http().get<TenantResetPreview>(API_ENDPOINTS.SYSTEM_ADMIN.TENANT_RESET(tenantId)),
    enabled,
  });
}

export function useResetTenantData(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { parts: string[]; confirmName: string }) =>
      http().post<{ parts: string[]; deleted: Record<string, number> }>(
        API_ENDPOINTS.SYSTEM_ADMIN.TENANT_RESET(tenantId),
        body,
      ),
    onSuccess: () => queryClient.invalidateQueries(),
  });
}
