"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { CustomerInteractionDto } from "@/core/application/dtos/CustomerInteractionDto";
import type { GetCustomerInteractionsParams } from "@/core/domain/repositories/ICustomerInteractionRepository";
import type { ICustomerInteractionService } from "@/core/domain/services/ICustomerInteractionService";

const CUSTOMER_INTERACTIONS_QUERY_KEY = ["customer-interactions"];

export function customerInteractionsQueryKey(
  customerId: string | null,
  params?: GetCustomerInteractionsParams
) {
  return [
    ...CUSTOMER_INTERACTIONS_QUERY_KEY,
    customerId,
    params?.page,
    params?.limit,
  ] as const;
}

export function useCustomerInteractions(
  customerId: string | null,
  params?: GetCustomerInteractionsParams
) {
  return useQuery({
    queryKey: customerInteractionsQueryKey(customerId, params),
    queryFn: () => {
      const service = container.resolve<ICustomerInteractionService>(
        "customerInteractionService"
      );
      return service.getAll(customerId!, params);
    },
    enabled: !!customerId,
  });
}

export function useCustomerInteraction(
  customerId: string | null,
  interactionId: string | null
) {
  return useQuery({
    queryKey: [
      ...CUSTOMER_INTERACTIONS_QUERY_KEY,
      customerId,
      interactionId,
    ],
    queryFn: () => {
      const service = container.resolve<ICustomerInteractionService>(
        "customerInteractionService"
      );
      return service.getById(customerId!, interactionId!);
    },
    enabled: !!customerId && !!interactionId,
  });
}

export function useCreateCustomerInteraction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      customerId,
      data,
    }: {
      customerId: string;
      data: Omit<CustomerInteractionDto, "id" | "customerId">;
    }) => {
      const service = container.resolve<ICustomerInteractionService>(
        "customerInteractionService"
      );
      return service.create(customerId, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...CUSTOMER_INTERACTIONS_QUERY_KEY, variables.customerId],
      });
    },
  });
}

export function useUpdateCustomerInteraction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      customerId,
      interactionId,
      data,
    }: {
      customerId: string;
      interactionId: string;
      data: Omit<CustomerInteractionDto, "id" | "customerId">;
    }) => {
      const service = container.resolve<ICustomerInteractionService>(
        "customerInteractionService"
      );
      return service.update(customerId, interactionId, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...CUSTOMER_INTERACTIONS_QUERY_KEY, variables.customerId],
      });
      queryClient.invalidateQueries({
        queryKey: [
          ...CUSTOMER_INTERACTIONS_QUERY_KEY,
          variables.customerId,
          variables.interactionId,
        ],
      });
    },
  });
}

export function useDeleteCustomerInteraction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      customerId,
      interactionId,
    }: {
      customerId: string;
      interactionId: string;
    }) => {
      const service = container.resolve<ICustomerInteractionService>(
        "customerInteractionService"
      );
      return service.delete(customerId, interactionId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...CUSTOMER_INTERACTIONS_QUERY_KEY, variables.customerId],
      });
    },
  });
}
