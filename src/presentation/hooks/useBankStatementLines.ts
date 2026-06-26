"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { IBankStatementLineService } from "@/core/domain/services/IBankStatementLineService";
import type {
  GetBankStatementLinesParams,
  BankStatementLineWriteDto,
} from "@/core/domain/repositories/IBankStatementLineRepository";

const BANK_STATEMENT_LINES_QUERY_KEY = ["bank-statement-lines"];

export function useBankStatementLines(
  bankStatementId: string | null,
  params?: GetBankStatementLinesParams
) {
  return useQuery({
    queryKey: [
      ...BANK_STATEMENT_LINES_QUERY_KEY,
      bankStatementId,
      params?.page,
      params?.limit,
      params?.search,
      params?.sortBy,
      params?.sortOrder,
    ],
    queryFn: () => {
      const service =
        container.resolve<IBankStatementLineService>("bankStatementLineService");
      return service.getAll(bankStatementId!, params);
    },
    enabled: !!bankStatementId,
  });
}

export function useBankStatementLine(
  bankStatementId: string | null,
  lineId: string | null
) {
  return useQuery({
    queryKey: [...BANK_STATEMENT_LINES_QUERY_KEY, bankStatementId, lineId],
    queryFn: () => {
      const service =
        container.resolve<IBankStatementLineService>("bankStatementLineService");
      return service.getById(bankStatementId!, lineId!);
    },
    enabled: !!bankStatementId && !!lineId,
  });
}

export function useCreateBankStatementLine(bankStatementId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BankStatementLineWriteDto) => {
      const service =
        container.resolve<IBankStatementLineService>("bankStatementLineService");
      return service.create(bankStatementId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BANK_STATEMENT_LINES_QUERY_KEY });
    },
  });
}

export function useUpdateBankStatementLine(bankStatementId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BankStatementLineWriteDto }) => {
      const service =
        container.resolve<IBankStatementLineService>("bankStatementLineService");
      return service.update(bankStatementId, id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: BANK_STATEMENT_LINES_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...BANK_STATEMENT_LINES_QUERY_KEY, bankStatementId, variables.id],
      });
    },
  });
}

export function useDeleteBankStatementLine(bankStatementId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      const service =
        container.resolve<IBankStatementLineService>("bankStatementLineService");
      return service.delete(bankStatementId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BANK_STATEMENT_LINES_QUERY_KEY });
    },
  });
}
