"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { IGoodsReceivedNoteService } from "@/core/domain/services/IGoodsReceivedNoteService";
import type {
  GetGoodsReceivedNotesParams,
  GoodsReceivedNoteWriteDto,
} from "@/core/domain/repositories/IGoodsReceivedNoteRepository";

const GOODS_RECEIVED_NOTES_QUERY_KEY = ["goods-received-notes"];

export function useGoodsReceivedNotes(params?: GetGoodsReceivedNotesParams) {
  return useQuery({
    queryKey: [
      ...GOODS_RECEIVED_NOTES_QUERY_KEY,
      params?.page,
      params?.limit,
      params?.search,
      params?.sortBy,
      params?.sortOrder,
    ],
    queryFn: () => {
      const service = container.resolve<IGoodsReceivedNoteService>(
        "goodsReceivedNoteService",
      );
      return service.getAll(params);
    },
  });
}

export function useGoodsReceivedNote(id: string | null) {
  return useQuery({
    queryKey: [...GOODS_RECEIVED_NOTES_QUERY_KEY, id],
    queryFn: () => {
      const service = container.resolve<IGoodsReceivedNoteService>(
        "goodsReceivedNoteService",
      );
      return service.getById(id!);
    },
    enabled: !!id,
  });
}

export function useCreateGoodsReceivedNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: GoodsReceivedNoteWriteDto) => {
      const service = container.resolve<IGoodsReceivedNoteService>(
        "goodsReceivedNoteService",
      );
      return service.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: GOODS_RECEIVED_NOTES_QUERY_KEY,
      });
    },
  });
}

export function useUpdateGoodsReceivedNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: GoodsReceivedNoteWriteDto;
    }) => {
      const service = container.resolve<IGoodsReceivedNoteService>(
        "goodsReceivedNoteService",
      );
      return service.update(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: GOODS_RECEIVED_NOTES_QUERY_KEY,
      });
      queryClient.invalidateQueries({
        queryKey: [...GOODS_RECEIVED_NOTES_QUERY_KEY, variables.id],
      });
    },
  });
}

export function useDeleteGoodsReceivedNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      const service = container.resolve<IGoodsReceivedNoteService>(
        "goodsReceivedNoteService",
      );
      return service.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: GOODS_RECEIVED_NOTES_QUERY_KEY,
      });
    },
  });
}
