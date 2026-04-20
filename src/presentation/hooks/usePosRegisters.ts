"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { IPosRegisterService } from "@/core/domain/services/IPosRegisterService";
import type { PosRegisterDto } from "@/core/application/dtos/PosRegisterDto";
import type { GetPosRegistersParams } from "@/core/domain/repositories/IPosRegisterRepository";

const POS_REGISTERS_QUERY_KEY = ["pos-registers"];

export function usePosRegisters(params?: GetPosRegistersParams) {
  return useQuery({
    queryKey: [
      ...POS_REGISTERS_QUERY_KEY,
      params?.page,
      params?.limit,
      params?.search,
      params?.sortBy,
      params?.sortOrder,
    ],
    queryFn: () => {
      const service = container.resolve<IPosRegisterService>("posRegisterService");
      return service.getAll(params);
    },
  });
}

export function usePosRegister(id: string | null) {
  return useQuery({
    queryKey: [...POS_REGISTERS_QUERY_KEY, id],
    queryFn: () => {
      const service = container.resolve<IPosRegisterService>("posRegisterService");
      return service.getById(id!);
    },
    enabled: !!id,
  });
}

export function useCreatePosRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<PosRegisterDto, "id" | "createdAt" | "updatedAt">) => {
      const service = container.resolve<IPosRegisterService>("posRegisterService");
      return service.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: POS_REGISTERS_QUERY_KEY });
    },
  });
}

export function useUpdatePosRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Omit<PosRegisterDto, "id" | "createdAt" | "updatedAt">;
    }) => {
      const service = container.resolve<IPosRegisterService>("posRegisterService");
      return service.update(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: POS_REGISTERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...POS_REGISTERS_QUERY_KEY, variables.id] });
    },
  });
}

export function useDeletePosRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      const service = container.resolve<IPosRegisterService>("posRegisterService");
      return service.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: POS_REGISTERS_QUERY_KEY });
    },
  });
}

