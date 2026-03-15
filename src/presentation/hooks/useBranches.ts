"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { IBranchService } from "@/core/domain/services/IBranchService";
import type { BranchDto } from "@/core/application/dtos/BranchDto";
import type { GetBranchesParams } from "@/core/domain/repositories/IBranchRepository";

const BRANCHES_QUERY_KEY = ["branches"];

export function useBranches(params?: GetBranchesParams) {
  return useQuery({
    queryKey: [...BRANCHES_QUERY_KEY, params?.page, params?.limit],
    queryFn: () => {
      const service = container.resolve<IBranchService>("branchService");
      return service.getAll(params);
    },
  });
}

export function useBranch(id: string | null) {
  return useQuery({
    queryKey: [...BRANCHES_QUERY_KEY, id],
    queryFn: () => {
      const service = container.resolve<IBranchService>("branchService");
      return service.getById(id!);
    },
    enabled: !!id,
  });
}

export function useCreateBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<BranchDto, "id">) => {
      const service = container.resolve<IBranchService>("branchService");
      return service.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BRANCHES_QUERY_KEY });
    },
  });
}

export function useUpdateBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: { id: string; data: Omit<BranchDto, "id"> }) => {
      const service = container.resolve<IBranchService>("branchService");
      return service.update(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: BRANCHES_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...BRANCHES_QUERY_KEY, variables.id],
      });
    },
  });
}

export function useDeleteBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      const service = container.resolve<IBranchService>("branchService");
      return service.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BRANCHES_QUERY_KEY });
    },
  });
}
