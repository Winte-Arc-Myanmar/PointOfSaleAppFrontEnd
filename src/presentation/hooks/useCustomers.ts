"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { CustomerDto } from "@/core/application/dtos/CustomerDto";
import type { GetCustomersParams } from "@/core/domain/repositories/ICustomerRepository";
import type { ICustomerService } from "@/core/domain/services/ICustomerService";

const CUSTOMERS_QUERY_KEY = ["customers"];

export function useCustomers(params?: GetCustomersParams) {
  return useQuery({
    queryKey: [...CUSTOMERS_QUERY_KEY, params?.page, params?.limit, params?.search],
    queryFn: () => {
      const service = container.resolve<ICustomerService>("customerService");
      return service.getAll(params);
    },
  });
}

export function useCustomer(id: string | null) {
  return useQuery({
    queryKey: [...CUSTOMERS_QUERY_KEY, id],
    queryFn: () => {
      const service = container.resolve<ICustomerService>("customerService");
      return service.getById(id!);
    },
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<CustomerDto, "id">) => {
      const service = container.resolve<ICustomerService>("customerService");
      return service.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMERS_QUERY_KEY });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<CustomerDto, "id"> }) => {
      const service = container.resolve<ICustomerService>("customerService");
      return service.update(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: CUSTOMERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...CUSTOMERS_QUERY_KEY, variables.id] });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      const service = container.resolve<ICustomerService>("customerService");
      return service.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMERS_QUERY_KEY });
    },
  });
}

