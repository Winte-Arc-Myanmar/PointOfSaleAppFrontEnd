"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { HttpClient } from "@/core/infrastructure/api/HttpClient";
import { API_ENDPOINTS } from "@/core/infrastructure/api/constants";

export interface MenuItemIngredient {
  ingredientVariantId: string;
  quantity: string | number;
  uomId: string;
}

export interface MenuItemSetup {
  modifierGroupIds: string[];
  ingredients: (MenuItemIngredient & { productId?: string; name?: string })[];
}

const KEY = (productId: string) => ["products", productId, "setup"];
const http = () => container.resolve<HttpClient>("httpClient");

/** A menu item's add-on groups and the ingredients one serving uses. */
export function useMenuItemSetup(productId: string | null | undefined) {
  return useQuery({
    queryKey: KEY(productId ?? ""),
    queryFn: () => http().get<MenuItemSetup>(API_ENDPOINTS.PRODUCTS.SETUP(productId!)),
    enabled: Boolean(productId),
  });
}

export function useSaveMenuItemSetup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, setup }: { productId: string; setup: Partial<MenuItemSetup> }) =>
      http().put<MenuItemSetup>(API_ENDPOINTS.PRODUCTS.SETUP(productId), setup),
    onSuccess: (saved, { productId }) => queryClient.setQueryData(KEY(productId), saved),
  });
}
