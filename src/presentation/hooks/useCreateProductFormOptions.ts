"use client";

import { useQuery } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { ITenantService } from "@/core/domain/services/ITenantService";
import type { IUomService } from "@/core/domain/services/IUomService";
import type { ICategoryService } from "@/core/domain/services/ICategoryService";
import { getPaginatedItems } from "@/presentation/hooks/pagination";
import { usePermissions } from "@/presentation/hooks/usePermissions";

const QUERY_KEY = ["create-product-form-options"];

const LIST_LIMIT = 500;

/**
 * The lists the product forms choose from, each loaded on its own so the form can
 * show at once and fill each list as it arrives. Tenants load only when the user
 * has to pick one.
 */
export function useCreateProductFormOptions() {
  const { tenantId } = usePermissions();
  const tenants = useQuery({
    queryKey: [...QUERY_KEY, "tenants"],
    queryFn: async () =>
      getPaginatedItems(await container.resolve<ITenantService>("tenantService").getAll()),
    enabled: !tenantId,
  });
  const uoms = useQuery({
    queryKey: [...QUERY_KEY, "uoms"],
    queryFn: async () =>
      getPaginatedItems(
        await container.resolve<IUomService>("uomService").getAll({ page: 1, limit: LIST_LIMIT }),
      ),
  });
  const categories = useQuery({
    queryKey: [...QUERY_KEY, "categories"],
    queryFn: async () =>
      getPaginatedItems(
        await container
          .resolve<ICategoryService>("categoryService")
          .getAll({ page: 1, limit: LIST_LIMIT }),
      ),
  });
  return {
    data: {
      tenants: tenants.data ?? [],
      uoms: uoms.data ?? [],
      categories: categories.data ?? [],
    },
    isLoading: uoms.isLoading || categories.isLoading,
    error: uoms.error ?? categories.error ?? null,
  };
}
