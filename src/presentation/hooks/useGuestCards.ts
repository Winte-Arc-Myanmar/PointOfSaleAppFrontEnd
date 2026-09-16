"use client";

import { useQuery } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { IMembershipMemberService } from "@/core/domain/services/IMembershipMemberService";
import type { GetMembershipMembersParams } from "@/core/domain/repositories/IMembershipMemberRepository";
import type { MembershipGuestCard } from "@/core/domain/entities/MembershipMember";

const QUERY_KEY = ["guest-cards"];

export function useGuestCards(params?: GetMembershipMembersParams) {
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
      const service = container.resolve<IMembershipMemberService>("membershipMemberService");
      return service.getAllGuestCards(params);
    },
  });
}

export function useGuestCard(id: string | null) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: async () => {
      if (!id) return null as MembershipGuestCard | null;
      const service = container.resolve<IMembershipMemberService>("membershipMemberService");
      return service.getGuestCardById(id);
    },
    enabled: !!id,
  });
}
