"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type {
  RecipeCreateDto,
  RecipeUpdateDto,
} from "@/core/application/dtos/RecipeDto";
import type { GetRecipesParams } from "@/core/domain/repositories/IRecipeRepository";
import type { IRecipeService } from "@/core/domain/services/IRecipeService";

const RECIPES_QUERY_KEY = ["recipes"];

export function useRecipes(params?: GetRecipesParams) {
  return useQuery({
    queryKey: [
      ...RECIPES_QUERY_KEY,
      params?.page,
      params?.limit,
      params?.search,
      params?.sortBy,
      params?.sortOrder,
    ],
    queryFn: () => {
      const service = container.resolve<IRecipeService>("recipeService");
      return service.getAll(params);
    },
  });
}

export function useRecipe(id: string | null) {
  return useQuery({
    queryKey: [...RECIPES_QUERY_KEY, id],
    queryFn: () => {
      const service = container.resolve<IRecipeService>("recipeService");
      return service.getById(id!);
    },
    enabled: !!id,
  });
}

export function useRecipeByVariant(variantId: string | null) {
  return useQuery({
    queryKey: [...RECIPES_QUERY_KEY, "variant", variantId],
    queryFn: () => {
      const service = container.resolve<IRecipeService>("recipeService");
      return service.getByVariantId(variantId!);
    },
    enabled: !!variantId,
  });
}

export function useCreateRecipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RecipeCreateDto) => {
      const service = container.resolve<IRecipeService>("recipeService");
      return service.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RECIPES_QUERY_KEY });
    },
  });
}

export function useUpdateRecipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RecipeUpdateDto }) => {
      const service = container.resolve<IRecipeService>("recipeService");
      return service.update(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: RECIPES_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...RECIPES_QUERY_KEY, variables.id],
      });
    },
  });
}

export function useDeleteRecipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      const service = container.resolve<IRecipeService>("recipeService");
      return service.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RECIPES_QUERY_KEY });
    },
  });
}
