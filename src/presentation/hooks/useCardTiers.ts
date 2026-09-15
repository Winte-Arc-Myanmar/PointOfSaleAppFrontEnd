"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { ICardTierService } from "@/core/domain/services/ICardTierService";
import type { CardTierWriteDto } from "@/core/application/dtos/CardTierDto";
import type { GetCardTiersParams } from "@/core/domain/repositories/ICardTierRepository";

const CARD_TIERS_QUERY_KEY = ["card-tiers"];

export function useCardTiers(params?: GetCardTiersParams) {
  return useQuery({
    queryKey: [
      ...CARD_TIERS_QUERY_KEY,
      params?.page,
      params?.limit,
      params?.search,
      params?.sortBy,
      params?.sortOrder,
    ],
    queryFn: () => {
      const service = container.resolve<ICardTierService>("cardTierService");
      return service.getAll(params);
    },
  });
}

export function useCardTier(id: string | null) {
  return useQuery({
    queryKey: [...CARD_TIERS_QUERY_KEY, id],
    queryFn: () => {
      const service = container.resolve<ICardTierService>("cardTierService");
      return service.getById(id!);
    },
    enabled: !!id,
  });
}

export function useCreateCardTier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CardTierWriteDto) => {
      const service = container.resolve<ICardTierService>("cardTierService");
      return service.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CARD_TIERS_QUERY_KEY });
    },
  });
}

export function useUpdateCardTier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CardTierWriteDto }) => {
      const service = container.resolve<ICardTierService>("cardTierService");
      return service.update(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: CARD_TIERS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...CARD_TIERS_QUERY_KEY, variables.id],
      });
    },
  });
}

export function useDeleteCardTier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      const service = container.resolve<ICardTierService>("cardTierService");
      return service.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CARD_TIERS_QUERY_KEY });
    },
  });
}
