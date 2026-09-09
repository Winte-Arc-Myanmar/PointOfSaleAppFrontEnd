"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { IMembershipCardTemplateService } from "@/core/domain/services/IMembershipCardTemplateService";
import type { MembershipCardTemplateDto } from "@/core/application/dtos/MembershipCardTemplateDto";
import type { GetMembershipCardTemplatesParams } from "@/core/domain/repositories/IMembershipCardTemplateRepository";
import type { PaginatedResult } from "@/core/domain/types/pagination";
import type { MembershipCardTemplate } from "@/core/domain/entities/MembershipCardTemplate";
import { getDemoMembershipCardTemplatesPage } from "@/features/membership-card-templates/presentation/membership-card-demo-data";

const QUERY_KEY = ["membership-card-templates"];

function isDemoTemplateId(id: string) {
  return id.startsWith("mct-");
}

export function useMembershipCardTemplates(
  params?: GetMembershipCardTemplatesParams,
) {
  return useQuery({
    queryKey: [
      ...QUERY_KEY,
      params?.page,
      params?.limit,
      params?.search,
      params?.sortBy,
      params?.sortOrder,
    ],
    queryFn: async () => {
      try {
        const service = container.resolve<IMembershipCardTemplateService>(
          "membershipCardTemplateService",
        );
        const result = await service.getAll(params);
        if (result.items.length > 0) return result;
      } catch {
        // Backend may not be ready yet.
      }
      return getDemoMembershipCardTemplatesPage(params);
    },
  });
}

export function useCreateMembershipCardTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      data: Omit<
        MembershipCardTemplateDto,
        "id" | "createdAt" | "updatedAt" | "deletedAt"
      >,
    ) => {
      const service = container.resolve<IMembershipCardTemplateService>(
        "membershipCardTemplateService",
      );
      return service.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeleteMembershipCardTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (isDemoTemplateId(id)) {
        queryClient.setQueriesData(
          { queryKey: QUERY_KEY },
          (current: PaginatedResult<MembershipCardTemplate> | undefined) => {
            if (!current) return current;
            const items = current.items.filter((item) => String(item.id) !== id);
            return {
              ...current,
              items,
              total: Math.max(0, current.total - 1),
            };
          },
        );
        return;
      }

      const service = container.resolve<IMembershipCardTemplateService>(
        "membershipCardTemplateService",
      );
      await service.delete(id);
    },
    onSuccess: (_data, id) => {
      if (!isDemoTemplateId(id)) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      }
    },
  });
}
