"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { VendorDto } from "@/core/application/dtos/VendorDto";
import type { GetVendorsParams } from "@/core/domain/repositories/IVendorRepository";
import type { IVendorService } from "@/core/domain/services/IVendorService";

const VENDORS_QUERY_KEY = ["vendors"];

export function useVendors(params?: GetVendorsParams) {
  return useQuery({
    queryKey: [...VENDORS_QUERY_KEY, params?.page, params?.limit],
    queryFn: () => {
      const service = container.resolve<IVendorService>("vendorService");
      return service.getAll(params);
    },
  });
}

export function useVendor(id: string | null) {
  return useQuery({
    queryKey: [...VENDORS_QUERY_KEY, id],
    queryFn: () => {
      const service = container.resolve<IVendorService>("vendorService");
      return service.getById(id!);
    },
    enabled: !!id,
  });
}

export function useCreateVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<VendorDto, "id">) => {
      const service = container.resolve<IVendorService>("vendorService");
      return service.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VENDORS_QUERY_KEY });
    },
  });
}

export function useUpdateVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<VendorDto, "id"> }) => {
      const service = container.resolve<IVendorService>("vendorService");
      return service.update(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: VENDORS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...VENDORS_QUERY_KEY, variables.id],
      });
    },
  });
}

export function useDeleteVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      const service = container.resolve<IVendorService>("vendorService");
      return service.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VENDORS_QUERY_KEY });
    },
  });
}

