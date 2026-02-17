"use client";

import { useQuery } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { IProductService } from "@/core/domain/services/IProductService";

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: () => {
      const productService = container.resolve<IProductService>("productService");
      return productService.getAll();
    },
  });
}
