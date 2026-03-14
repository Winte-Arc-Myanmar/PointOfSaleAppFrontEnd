"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { IProductVariantService } from "@/core/domain/services/IProductVariantService";
import type { ProductVariantDto } from "@/core/application/dtos/ProductVariantDto";
import type { GetProductVariantsParams } from "@/core/domain/repositories/IProductVariantRepository";

function productVariantsQueryKey(productId: string, params?: GetProductVariantsParams) {
  return ["products", productId, "variants", params?.page, params?.limit];
}

export function useProductVariants(
  productId: string | null,
  params?: GetProductVariantsParams
) {
  return useQuery({
    queryKey: productVariantsQueryKey(productId ?? "", params),
    queryFn: () => {
      const service = container.resolve<IProductVariantService>(
        "productVariantService"
      );
      return service.getAll(productId!, params);
    },
    enabled: !!productId,
  });
}

export function useProductVariant(
  productId: string | null,
  variantId: string | null
) {
  return useQuery({
    queryKey: ["products", productId, "variants", variantId],
    queryFn: () => {
      const service = container.resolve<IProductVariantService>(
        "productVariantService"
      );
      return service.getById(productId!, variantId!);
    },
    enabled: !!productId && !!variantId,
  });
}

export function useCreateProductVariant(productId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<ProductVariantDto, "id">) => {
      const service = container.resolve<IProductVariantService>(
        "productVariantService"
      );
      return service.create(productId!, data);
    },
    onSuccess: () => {
      if (productId) {
        queryClient.invalidateQueries({
          queryKey: ["products", productId, "variants"],
        });
      }
    },
  });
}

export function useUpdateProductVariant(productId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: { id: string; data: Omit<ProductVariantDto, "id"> }) => {
      const service = container.resolve<IProductVariantService>(
        "productVariantService"
      );
      return service.update(productId!, id, data);
    },
    onSuccess: (_, variables) => {
      if (productId) {
        queryClient.invalidateQueries({
          queryKey: ["products", productId, "variants"],
        });
        queryClient.invalidateQueries({
          queryKey: ["products", productId, "variants", variables.id],
        });
      }
    },
  });
}

export function useDeleteProductVariant(productId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variantId: string) => {
      const service = container.resolve<IProductVariantService>(
        "productVariantService"
      );
      return service.delete(productId!, variantId);
    },
    onSuccess: () => {
      if (productId) {
        queryClient.invalidateQueries({
          queryKey: ["products", productId, "variants"],
        });
      }
    },
  });
}
