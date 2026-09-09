"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { IMembershipCardCategoryService } from "@/core/domain/services/IMembershipCardCategoryService";
import type { MembershipCardCategoryDto } from "@/core/application/dtos/MembershipCardCategoryDto";
import type { GetMembershipCardCategoriesParams } from "@/core/domain/repositories/IMembershipCardCategoryRepository";
import {
  DEMO_MEMBERSHIP_CARD_CATEGORIES,
  getDemoMembershipCardCategoriesPage,
} from "@/features/membership-card-templates/presentation/membership-card-demo-data";

const QUERY_KEY = ["membership-card-categories"];

export function useMembershipCardCategoryTree() {
  return useQuery({
    queryKey: [...QUERY_KEY, "tree"],
    queryFn: async () => {
      try {
        const service = container.resolve<IMembershipCardCategoryService>(
          "membershipCardCategoryService",
        );
        const tree = await service.getTree();
        if (Array.isArray(tree) && tree.length > 0) return tree;
      } catch {
        // Backend may not be ready yet.
      }
      return DEMO_MEMBERSHIP_CARD_CATEGORIES;
    },
  });
}

export function useMembershipCardCategories(
  params?: GetMembershipCardCategoriesParams,
) {
  return useQuery({
    queryKey: [...QUERY_KEY, params?.page, params?.limit],
    queryFn: async () => {
      try {
        const service = container.resolve<IMembershipCardCategoryService>(
          "membershipCardCategoryService",
        );
        const result = await service.getAll(params);
        if (result.items.length > 0) return result;
      } catch {
        // Backend may not be ready yet.
      }
      return getDemoMembershipCardCategoriesPage(params);
    },
  });
}

export function useCreateMembershipCardCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<MembershipCardCategoryDto, "id">) => {
      const service = container.resolve<IMembershipCardCategoryService>(
        "membershipCardCategoryService",
      );
      return service.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
