"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { ITransferOrderLineService } from "@/core/domain/services/ITransferOrderLineService";
import type {
  GetTransferOrderLinesParams,
  TransferOrderLineWriteDto,
} from "@/core/domain/repositories/ITransferOrderLineRepository";

const TRANSFER_ORDER_LINES_QUERY_KEY = ["transfer-order-lines"];

export function useTransferOrderLines(
  transferOrderId: string | null,
  params?: GetTransferOrderLinesParams,
) {
  return useQuery({
    queryKey: [
      ...TRANSFER_ORDER_LINES_QUERY_KEY,
      transferOrderId,
      params?.page,
      params?.limit,
      params?.search,
      params?.sortBy,
      params?.sortOrder,
    ],
    queryFn: () => {
      const service = container.resolve<ITransferOrderLineService>(
        "transferOrderLineService",
      );
      return service.getAll(transferOrderId!, params);
    },
    enabled: !!transferOrderId,
  });
}

export function useTransferOrderLine(
  transferOrderId: string | null,
  lineId: string | null,
) {
  return useQuery({
    queryKey: [...TRANSFER_ORDER_LINES_QUERY_KEY, transferOrderId, lineId],
    queryFn: () => {
      const service = container.resolve<ITransferOrderLineService>(
        "transferOrderLineService",
      );
      return service.getById(transferOrderId!, lineId!);
    },
    enabled: !!transferOrderId && !!lineId,
  });
}

export function useCreateTransferOrderLine(transferOrderId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TransferOrderLineWriteDto) => {
      const service = container.resolve<ITransferOrderLineService>(
        "transferOrderLineService",
      );
      return service.create(transferOrderId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: TRANSFER_ORDER_LINES_QUERY_KEY,
      });
    },
  });
}

export function useUpdateTransferOrderLine(transferOrderId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: TransferOrderLineWriteDto;
    }) => {
      const service = container.resolve<ITransferOrderLineService>(
        "transferOrderLineService",
      );
      return service.update(transferOrderId, id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: TRANSFER_ORDER_LINES_QUERY_KEY,
      });
      queryClient.invalidateQueries({
        queryKey: [
          ...TRANSFER_ORDER_LINES_QUERY_KEY,
          transferOrderId,
          variables.id,
        ],
      });
    },
  });
}

export function useDeleteTransferOrderLine(transferOrderId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      const service = container.resolve<ITransferOrderLineService>(
        "transferOrderLineService",
      );
      return service.delete(transferOrderId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: TRANSFER_ORDER_LINES_QUERY_KEY,
      });
    },
  });
}
