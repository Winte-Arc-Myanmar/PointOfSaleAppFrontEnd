"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { ICategoryService } from "@/core/domain/services/ICategoryService";
import type { CategoryDto } from "@/core/application/dtos/CategoryDto";
import type { GetCategoriesParams } from "@/core/domain/repositories/ICategoryRepository";

const CATEGORIES_QUERY_KEY = ["categories"];

export function useCategoryTree() {
  return useQuery({
    queryKey: [...CATEGORIES_QUERY_KEY, "tree"],
    queryFn: () => {
      const service = container.resolve<ICategoryService>("categoryService");
      return service.getTree();
    },
  });
}

export function useCategories(params?: GetCategoriesParams) {
  return useQuery({
    queryKey: [...CATEGORIES_QUERY_KEY, params?.page, params?.limit],
    queryFn: () => {
      const service = container.resolve<ICategoryService>("categoryService");
      return service.getAll(params);
    },
  });
}

export function useCategory(id: string | null) {
  return useQuery({
    queryKey: [...CATEGORIES_QUERY_KEY, id],
    queryFn: () => {
      const service = container.resolve<ICategoryService>("categoryService");
      return service.getById(id!);
    },
    enabled: !!id,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<CategoryDto, "id">) => {
      const service = container.resolve<ICategoryService>("categoryService");
      return service.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: { id: string; data: Omit<CategoryDto, "id"> }) => {
      const service = container.resolve<ICategoryService>("categoryService");
      return service.update(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...CATEGORIES_QUERY_KEY, variables.id],
      });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      const service = container.resolve<ICategoryService>("categoryService");
      return service.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
    },
  });
}
