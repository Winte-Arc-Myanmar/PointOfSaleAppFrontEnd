"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { IProductService } from "@/core/domain/services/IProductService";
import type { ProductDto } from "@/core/application/dtos/ProductDto";
import type { GetProductsParams } from "@/core/domain/repositories/IProductRepository";

const PRODUCTS_QUERY_KEY = ["products"];

export function useProducts(params?: GetProductsParams) {
  return useQuery({
    queryKey: [...PRODUCTS_QUERY_KEY, params?.page, params?.limit],
    queryFn: () => {
      const productService = container.resolve<IProductService>("productService");
      return productService.getAll(params);
    },
  });
}

export function useProduct(id: string | null) {
  return useQuery({
    queryKey: [...PRODUCTS_QUERY_KEY, id],
    queryFn: () => {
      const productService = container.resolve<IProductService>("productService");
      return productService.getById(id!);
    },
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<ProductDto, "id">) => {
      const productService = container.resolve<IProductService>("productService");
      return productService.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: { id: string; data: Omit<ProductDto, "id"> }) => {
      const productService = container.resolve<IProductService>("productService");
      return productService.update(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...PRODUCTS_QUERY_KEY, variables.id],
      });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      const productService = container.resolve<IProductService>("productService");
      return productService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
    },
  });
}
