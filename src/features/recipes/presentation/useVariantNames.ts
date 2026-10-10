"use client";

import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { useProducts } from "@/presentation/hooks/useProducts";
import { getPaginatedItems } from "@/presentation/hooks/pagination";
import container from "@/core/infrastructure/di/container";
import type { IProductVariantService } from "@/core/domain/services/IProductVariantService";

/** "Product · SKU" for each variant ID, so recipes show items by name. */
export function useVariantNames() {
  const { data: productsData } = useProducts({ page: 1, limit: 200 });
  const products = getPaginatedItems(productsData);
  const productVariantQueries = useQueries({
    queries: products.map((product) => ({
      queryKey: ["products", product.id, "variants", 1, 200],
      queryFn: () =>
        container.resolve<IProductVariantService>("productVariantService").getAll(product.id, {
          page: 1,
          limit: 200,
        }),
      enabled: products.length > 0,
    })),
  });
  return useMemo(() => {
    const result = new Map<string, string>();
    products.forEach((product, index) => {
      getPaginatedItems(productVariantQueries[index]?.data).forEach((variant) => {
        result.set(String(variant.id), `${product.name} · ${variant.variantSku || "Unnamed variant"}`);
      });
    });
    return result;
  }, [products, productVariantQueries]);
}
