"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type {
  ApiHostessRepository,
  GetHostessesParams,
} from "@/core/infrastructure/repositories/ApiHostessRepository";
import type { HostessInput } from "@/core/domain/entities/Hostess";

const QUERY_KEY = ["hostesses"];
const repository = () => container.resolve<ApiHostessRepository>("hostessRepository");

export function useHostesses(params?: GetHostessesParams) {
  return useQuery({
    queryKey: [...QUERY_KEY, params?.page, params?.limit, params?.search, params?.activeOnly],
    queryFn: () => repository().getAll(params),
  });
}

export function useHostess(id: string | null) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => repository().getById(id!),
    enabled: !!id,
  });
}

function useHostessMutation<V>(fn: (vars: V) => Promise<unknown>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export const useCreateHostess = () =>
  useHostessMutation((data: HostessInput) => repository().create(data));

export const useUpdateHostess = () =>
  useHostessMutation(({ id, data }: { id: string; data: Partial<HostessInput> }) =>
    repository().update(id, data),
  );

export const useDeleteHostess = () => useHostessMutation((id: string) => repository().remove(id));

