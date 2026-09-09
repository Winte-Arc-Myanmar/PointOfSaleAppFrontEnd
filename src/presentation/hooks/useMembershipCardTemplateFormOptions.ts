"use client";

import { useQuery } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { ITenantService } from "@/core/domain/services/ITenantService";
import type { IMembershipCardCategoryService } from "@/core/domain/services/IMembershipCardCategoryService";
import { getPaginatedItems } from "@/presentation/hooks/pagination";
import {
  DEMO_MEMBERSHIP_CARD_CATEGORIES,
  flattenMembershipCardCategories,
} from "@/features/membership-card-templates/presentation/membership-card-demo-data";

const QUERY_KEY = ["membership-card-template-form-options"];
const LIST_LIMIT = 500;

export function useMembershipCardTemplateFormOptions() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const tenantService = container.resolve<ITenantService>("tenantService");
      const categoryService = container.resolve<IMembershipCardCategoryService>(
        "membershipCardCategoryService",
      );

      let tenants = getPaginatedItems(await tenantService.getAll());
      let categories = [] as ReturnType<typeof flattenMembershipCardCategories>;

      try {
        const categoriesResult = await categoryService.getAll({
          page: 1,
          limit: LIST_LIMIT,
        });
        categories = getPaginatedItems(categoriesResult);
      } catch {
        categories = [];
      }

      if (categories.length === 0) {
        categories = flattenMembershipCardCategories(
          DEMO_MEMBERSHIP_CARD_CATEGORIES,
        );
      }

      return { tenants, categories };
    },
  });
}
