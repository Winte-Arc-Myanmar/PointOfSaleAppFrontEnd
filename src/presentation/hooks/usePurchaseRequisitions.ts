"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { IPurchaseRequisitionService } from "@/core/domain/services/IPurchaseRequisitionService";
import type {
  GetPurchaseRequisitionsParams,
  PurchaseRequisitionWriteDto,
} from "@/core/domain/repositories/IPurchaseRequisitionRepository";

const PURCHASE_REQUISITIONS_QUERY_KEY = ["purchase-requisitions"];

export function usePurchaseRequisitions(
  params?: GetPurchaseRequisitionsParams,
) {
  return useQuery({
    queryKey: [
      ...PURCHASE_REQUISITIONS_QUERY_KEY,
      params?.page,
      params?.limit,
      params?.search,
      params?.sortBy,
      params?.sortOrder,
    ],
    queryFn: () => {
      const service = container.resolve<IPurchaseRequisitionService>(
        "purchaseRequisitionService",
      );
      return service.getAll(params);
    },
  });
}

export function usePurchaseRequisition(id: string | null) {
  return useQuery({
    queryKey: [...PURCHASE_REQUISITIONS_QUERY_KEY, id],
    queryFn: () => {
      const service = container.resolve<IPurchaseRequisitionService>(
        "purchaseRequisitionService",
      );
      return service.getById(id!);
    },
    enabled: !!id,
  });
}

export function useCreatePurchaseRequisition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PurchaseRequisitionWriteDto) => {
      const service = container.resolve<IPurchaseRequisitionService>(
        "purchaseRequisitionService",
      );
      return service.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PURCHASE_REQUISITIONS_QUERY_KEY,
      });
    },
  });
}

export function useUpdatePurchaseRequisition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: PurchaseRequisitionWriteDto;
    }) => {
      const service = container.resolve<IPurchaseRequisitionService>(
        "purchaseRequisitionService",
      );
      return service.update(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: PURCHASE_REQUISITIONS_QUERY_KEY,
      });
      queryClient.invalidateQueries({
        queryKey: [...PURCHASE_REQUISITIONS_QUERY_KEY, variables.id],
      });
    },
  });
}

export function useDeletePurchaseRequisition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      const service = container.resolve<IPurchaseRequisitionService>(
        "purchaseRequisitionService",
      );
      return service.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PURCHASE_REQUISITIONS_QUERY_KEY,
      });
    },
  });
}
