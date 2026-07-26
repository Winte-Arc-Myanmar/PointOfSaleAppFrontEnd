"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { IVendorInvoiceService } from "@/core/domain/services/IVendorInvoiceService";
import type {
  GetVendorInvoicesParams,
  VendorInvoiceWriteDto,
} from "@/core/domain/repositories/IVendorInvoiceRepository";

const VENDOR_INVOICES_QUERY_KEY = ["vendor-invoices"];

export function useVendorInvoices(params?: GetVendorInvoicesParams) {
  return useQuery({
    queryKey: [
      ...VENDOR_INVOICES_QUERY_KEY,
      params?.page,
      params?.limit,
      params?.search,
      params?.sortBy,
      params?.sortOrder,
    ],
    queryFn: () => {
      const service = container.resolve<IVendorInvoiceService>(
        "vendorInvoiceService",
      );
      return service.getAll(params);
    },
  });
}

export function useVendorInvoice(id: string | null) {
  return useQuery({
    queryKey: [...VENDOR_INVOICES_QUERY_KEY, id],
    queryFn: () => {
      const service = container.resolve<IVendorInvoiceService>(
        "vendorInvoiceService",
      );
      return service.getById(id!);
    },
    enabled: !!id,
  });
}

export function useCreateVendorInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: VendorInvoiceWriteDto) => {
      const service = container.resolve<IVendorInvoiceService>(
        "vendorInvoiceService",
      );
      return service.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VENDOR_INVOICES_QUERY_KEY });
    },
  });
}

export function useUpdateVendorInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: VendorInvoiceWriteDto;
    }) => {
      const service = container.resolve<IVendorInvoiceService>(
        "vendorInvoiceService",
      );
      return service.update(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: VENDOR_INVOICES_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...VENDOR_INVOICES_QUERY_KEY, variables.id],
      });
    },
  });
}

export function useDeleteVendorInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      const service = container.resolve<IVendorInvoiceService>(
        "vendorInvoiceService",
      );
      return service.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VENDOR_INVOICES_QUERY_KEY });
    },
  });
}
