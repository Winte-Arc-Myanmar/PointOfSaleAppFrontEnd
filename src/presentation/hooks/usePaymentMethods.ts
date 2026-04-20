"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { IPaymentMethodService } from "@/core/domain/services/IPaymentMethodService";
import type { PaymentMethodDto } from "@/core/application/dtos/PaymentMethodDto";
import type { GetPaymentMethodsParams } from "@/core/domain/repositories/IPaymentMethodRepository";

const PAYMENT_METHODS_QUERY_KEY = ["payment-methods"];

export function usePaymentMethods(params?: GetPaymentMethodsParams) {
  return useQuery({
    queryKey: [
      ...PAYMENT_METHODS_QUERY_KEY,
      params?.page,
      params?.limit,
      params?.search,
      params?.sortBy,
      params?.sortOrder,
    ],
    queryFn: () => {
      const service = container.resolve<IPaymentMethodService>("paymentMethodService");
      return service.getAll(params);
    },
  });
}

export function usePaymentMethod(id: string | null) {
  return useQuery({
    queryKey: [...PAYMENT_METHODS_QUERY_KEY, id],
    queryFn: () => {
      const service = container.resolve<IPaymentMethodService>("paymentMethodService");
      return service.getById(id!);
    },
    enabled: !!id,
  });
}

export function useCreatePaymentMethod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<PaymentMethodDto, "id" | "createdAt" | "updatedAt">) => {
      const service = container.resolve<IPaymentMethodService>("paymentMethodService");
      return service.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYMENT_METHODS_QUERY_KEY });
    },
  });
}

export function useUpdatePaymentMethod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Omit<PaymentMethodDto, "id" | "createdAt" | "updatedAt">;
    }) => {
      const service = container.resolve<IPaymentMethodService>("paymentMethodService");
      return service.update(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: PAYMENT_METHODS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...PAYMENT_METHODS_QUERY_KEY, variables.id] });
    },
  });
}

export function useDeletePaymentMethod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      const service = container.resolve<IPaymentMethodService>("paymentMethodService");
      return service.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYMENT_METHODS_QUERY_KEY });
    },
  });
}

