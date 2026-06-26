"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { IBankStatementService } from "@/core/domain/services/IBankStatementService";
import type { BankStatementWriteDto } from "@/core/domain/repositories/IBankStatementRepository";
import type { GetBankStatementsParams } from "@/core/domain/repositories/IBankStatementRepository";

const BANK_STATEMENTS_QUERY_KEY = ["bank-statements"];

export function useBankStatements(params?: GetBankStatementsParams) {
  return useQuery({
    queryKey: [
      ...BANK_STATEMENTS_QUERY_KEY,
      params?.page,
      params?.limit,
      params?.search,
      params?.sortBy,
      params?.sortOrder,
    ],
    queryFn: () => {
      const service = container.resolve<IBankStatementService>("bankStatementService");
      return service.getAll(params);
    },
  });
}

export function useBankStatement(id: string | null) {
  return useQuery({
    queryKey: [...BANK_STATEMENTS_QUERY_KEY, id],
    queryFn: () => {
      const service = container.resolve<IBankStatementService>("bankStatementService");
      return service.getById(id!);
    },
    enabled: !!id,
  });
}

export function useCreateBankStatement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BankStatementWriteDto) => {
      const service = container.resolve<IBankStatementService>("bankStatementService");
      return service.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BANK_STATEMENTS_QUERY_KEY });
    },
  });
}

export function useUpdateBankStatement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BankStatementWriteDto }) => {
      const service = container.resolve<IBankStatementService>("bankStatementService");
      return service.update(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: BANK_STATEMENTS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...BANK_STATEMENTS_QUERY_KEY, variables.id],
      });
    },
  });
}

export function useDeleteBankStatement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      const service = container.resolve<IBankStatementService>("bankStatementService");
      return service.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BANK_STATEMENTS_QUERY_KEY });
    },
  });
}
