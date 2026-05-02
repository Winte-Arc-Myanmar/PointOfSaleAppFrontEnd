"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { ICheckoutService } from "@/core/domain/services/ICheckoutService";
import type { CheckoutRequestDto } from "@/core/application/dtos/CheckoutDto";

const CHECKOUT_QUERY_KEY = ["checkout"];

export function useCheckoutProcess() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CheckoutRequestDto) => {
      const service = container.resolve<ICheckoutService>("checkoutService");
      return service.process(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHECKOUT_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["sales-orders"] });
    },
  });
}

export function useCheckoutVoid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => {
      const service = container.resolve<ICheckoutService>("checkoutService");
      return service.void(orderId);
    },
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: CHECKOUT_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["sales-orders"] });
      queryClient.invalidateQueries({ queryKey: ["sales-orders", orderId] });
    },
  });
}

