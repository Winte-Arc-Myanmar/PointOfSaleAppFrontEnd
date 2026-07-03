"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { ICounterOrderService } from "@/core/domain/services/ICounterOrderService";

const COUNTER_ORDERS_QUERY_KEY = ["counter-orders"];

export function useCounterOrder(id: string | null) {
  return useQuery({
    queryKey: [...COUNTER_ORDERS_QUERY_KEY, id],
    queryFn: () => {
      const service = container.resolve<ICounterOrderService>("counterOrderService");
      return service.getById(id!);
    },
    enabled: !!id,
  });
}

export function usePickupCounterOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      const service = container.resolve<ICounterOrderService>("counterOrderService");
      return service.pickup(id);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: COUNTER_ORDERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...COUNTER_ORDERS_QUERY_KEY, id] });
    },
  });
}
