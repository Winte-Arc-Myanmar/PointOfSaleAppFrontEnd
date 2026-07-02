"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { IDiningTableService } from "@/core/domain/services/IDiningTableService";
import type { DiningTableStatus } from "@/core/domain/entities/DiningTable";
import type {
  DiningTableCreateDto,
  DiningTableUpdateDto,
} from "@/core/application/dtos/DiningTableDto";
import type { GetDiningTablesParams } from "@/core/domain/repositories/IDiningTableRepository";

const DINING_TABLES_QUERY_KEY = ["dining-tables"];

export function useDiningTables(params?: GetDiningTablesParams) {
  return useQuery({
    queryKey: [
      ...DINING_TABLES_QUERY_KEY,
      params?.page,
      params?.limit,
      params?.search,
      params?.sortBy,
      params?.sortOrder,
      params?.zoneId,
      params?.status,
    ],
    queryFn: () => {
      const service = container.resolve<IDiningTableService>("diningTableService");
      return service.getAll(params);
    },
  });
}

export function useDiningTable(id: string | null) {
  return useQuery({
    queryKey: [...DINING_TABLES_QUERY_KEY, id],
    queryFn: () => {
      const service = container.resolve<IDiningTableService>("diningTableService");
      return service.getById(id!);
    },
    enabled: !!id,
  });
}

export function useCreateDiningTable() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: DiningTableCreateDto) => {
      const service = container.resolve<IDiningTableService>("diningTableService");
      return service.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DINING_TABLES_QUERY_KEY });
    },
  });
}

export function useUpdateDiningTable() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: DiningTableUpdateDto }) => {
      const service = container.resolve<IDiningTableService>("diningTableService");
      return service.update(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: DINING_TABLES_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...DINING_TABLES_QUERY_KEY, variables.id],
      });
    },
  });
}

export function useUpdateDiningTableStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: DiningTableStatus }) => {
      const service = container.resolve<IDiningTableService>("diningTableService");
      return service.updateStatus(id, status);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: DINING_TABLES_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...DINING_TABLES_QUERY_KEY, variables.id],
      });
    },
  });
}

export function useDeleteDiningTable() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      const service = container.resolve<IDiningTableService>("diningTableService");
      return service.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DINING_TABLES_QUERY_KEY });
    },
  });
}
