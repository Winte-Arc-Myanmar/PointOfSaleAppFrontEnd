"use client";

import { useQuery } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { ITenantService } from "@/core/domain/services/ITenantService";
import type { IUomService } from "@/core/domain/services/IUomService";
import type { ICategoryService } from "@/core/domain/services/ICategoryService";
import { getPaginatedItems } from "@/presentation/hooks/pagination";

const QUERY_KEY = ["create-product-form-options"];

const LIST_LIMIT = 500;

export function useCreateProductFormOptions() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const tenantService = container.resolve<ITenantService>("tenantService");
      const uomService = container.resolve<IUomService>("uomService");
      const categoryService = container.resolve<ICategoryService>(
        "categoryService"
      );

      const [tenantsResult, uomsResult, categoriesResult] = await Promise.all([
        tenantService.getAll(),
        uomService.getAll({ page: 1, limit: LIST_LIMIT }),
        categoryService.getAll({ page: 1, limit: LIST_LIMIT }),
      ]);

      return {
        tenants: getPaginatedItems(tenantsResult),
        uoms: getPaginatedItems(uomsResult),
        categories: getPaginatedItems(categoriesResult),
      };
    },
  });
}
