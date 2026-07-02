"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { IKitchenPrinterService } from "@/core/domain/services/IKitchenPrinterService";
import type {
  KitchenPrinterCreateDto,
  KitchenPrinterUpdateDto,
} from "@/core/application/dtos/KitchenPrinterDto";
import type { GetKitchenPrintersParams } from "@/core/domain/repositories/IKitchenPrinterRepository";

const KITCHEN_PRINTERS_QUERY_KEY = ["kitchen-printers"];

export function useKitchenPrinters(params?: GetKitchenPrintersParams) {
  return useQuery({
    queryKey: [
      ...KITCHEN_PRINTERS_QUERY_KEY,
      params?.page,
      params?.limit,
      params?.search,
      params?.sortBy,
      params?.sortOrder,
    ],
    queryFn: () => {
      const service = container.resolve<IKitchenPrinterService>("kitchenPrinterService");
      return service.getAll(params);
    },
  });
}

export function useKitchenPrinter(id: string | null) {
  return useQuery({
    queryKey: [...KITCHEN_PRINTERS_QUERY_KEY, id],
    queryFn: () => {
      const service = container.resolve<IKitchenPrinterService>("kitchenPrinterService");
      return service.getById(id!);
    },
    enabled: !!id,
  });
}

export function useCreateKitchenPrinter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: KitchenPrinterCreateDto) => {
      const service = container.resolve<IKitchenPrinterService>("kitchenPrinterService");
      return service.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KITCHEN_PRINTERS_QUERY_KEY });
    },
  });
}

export function useUpdateKitchenPrinter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: KitchenPrinterUpdateDto }) => {
      const service = container.resolve<IKitchenPrinterService>("kitchenPrinterService");
      return service.update(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: KITCHEN_PRINTERS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...KITCHEN_PRINTERS_QUERY_KEY, variables.id],
      });
    },
  });
}

export function useDeleteKitchenPrinter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      const service = container.resolve<IKitchenPrinterService>("kitchenPrinterService");
      return service.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KITCHEN_PRINTERS_QUERY_KEY });
    },
  });
}

export function useAttachCategoryToKitchenPrinter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ printerId, categoryId }: { printerId: string; categoryId: string }) => {
      const service = container.resolve<IKitchenPrinterService>("kitchenPrinterService");
      return service.attachCategory(printerId, categoryId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...KITCHEN_PRINTERS_QUERY_KEY, variables.printerId],
      });
    },
  });
}

export function useDetachCategoryFromKitchenPrinter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ printerId, categoryId }: { printerId: string; categoryId: string }) => {
      const service = container.resolve<IKitchenPrinterService>("kitchenPrinterService");
      return service.detachCategory(printerId, categoryId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...KITCHEN_PRINTERS_QUERY_KEY, variables.printerId],
      });
    },
  });
}
