"use client";

import { useQuery } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { ITenantService } from "@/core/domain/services/ITenantService";
import type { ICategoryService } from "@/core/domain/services/ICategoryService";

const QUERY_KEY = ["category-form-options"];

const LIST_LIMIT = 500;

export function useCategoryFormOptions() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const tenantService = container.resolve<ITenantService>("tenantService");
      const categoryService = container.resolve<ICategoryService>(
        "categoryService"
      );

      const [tenants, categories] = await Promise.all([
        tenantService.getAll(),
        categoryService.getAll({ page: 1, limit: LIST_LIMIT }),
      ]);

      return { tenants, categories };
    },
  });
}
