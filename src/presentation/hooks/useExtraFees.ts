"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { ApiExtraFeeRepository } from "@/core/infrastructure/repositories/ApiExtraFeeRepository";
import type { ExtraFeeInput } from "@/core/domain/entities/ExtraFee";

const QUERY_KEY = ["extra-fees"];
const repository = () => container.resolve<ApiExtraFeeRepository>("extraFeeRepository");

export function useExtraFees() {
  return useQuery({ queryKey: QUERY_KEY, queryFn: () => repository().getAll() });
}

function useExtraFeeMutation<V>(fn: (vars: V) => Promise<unknown>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export const useCreateExtraFee = () => useExtraFeeMutation((data: ExtraFeeInput) => repository().create(data));

export const useUpdateExtraFee = () =>
  useExtraFeeMutation(({ id, data }: { id: string; data: Partial<ExtraFeeInput> }) => repository().update(id, data));

export const useDeleteExtraFee = () => useExtraFeeMutation((id: string) => repository().remove(id));
