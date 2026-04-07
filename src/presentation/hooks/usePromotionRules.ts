"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { IPromotionRuleService } from "@/core/domain/services/IPromotionRuleService";
import type { PromotionRuleDto } from "@/core/application/dtos/PromotionRuleDto";
import type { GetPromotionRulesParams } from "@/core/domain/repositories/IPromotionRuleRepository";

const PROMOTION_RULES_QUERY_KEY = ["promotion-rules"];

export function usePromotionRules(params?: GetPromotionRulesParams) {
  return useQuery({
    queryKey: [
      ...PROMOTION_RULES_QUERY_KEY,
      params?.page,
      params?.limit,
      params?.search,
      params?.sortBy,
      params?.sortOrder,
    ],
    queryFn: () => {
      const service = container.resolve<IPromotionRuleService>(
        "promotionRuleService"
      );
      return service.getAll(params);
    },
  });
}

export function usePromotionRule(id: string | null) {
  return useQuery({
    queryKey: [...PROMOTION_RULES_QUERY_KEY, id],
    queryFn: () => {
      const service = container.resolve<IPromotionRuleService>(
        "promotionRuleService"
      );
      return service.getById(id!);
    },
    enabled: !!id,
  });
}

export function useCreatePromotionRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      data: Omit<PromotionRuleDto, "id" | "deletedAt" | "createdAt" | "updatedAt">
    ) => {
      const service = container.resolve<IPromotionRuleService>(
        "promotionRuleService"
      );
      return service.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROMOTION_RULES_QUERY_KEY });
    },
  });
}

export function useUpdatePromotionRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Omit<PromotionRuleDto, "id" | "deletedAt" | "createdAt" | "updatedAt">;
    }) => {
      const service = container.resolve<IPromotionRuleService>(
        "promotionRuleService"
      );
      return service.update(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: PROMOTION_RULES_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...PROMOTION_RULES_QUERY_KEY, variables.id],
      });
    },
  });
}

export function useDeletePromotionRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      const service = container.resolve<IPromotionRuleService>(
        "promotionRuleService"
      );
      return service.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROMOTION_RULES_QUERY_KEY });
    },
  });
}

