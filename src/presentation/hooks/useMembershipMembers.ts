"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { IMembershipMemberService } from "@/core/domain/services/IMembershipMemberService";
import type { GetMembershipMembersParams } from "@/core/domain/repositories/IMembershipMemberRepository";
import type {
  MembershipBindCardRequest,
  MembershipRefundRequest,
  MembershipRegisterRequest,
  MembershipTopupRequest,
} from "@/core/domain/entities/MembershipMember";
import {
  createDemoMembershipMember,
  getDemoMembershipMemberById,
  getDemoMembershipMembersPage,
  isDemoMembershipId,
  upsertDemoMembershipMember,
} from "@/features/memberships/presentation/membership-demo-data";
import { DEMO_MEMBERSHIP_CARD_TEMPLATES } from "@/features/membership-card-templates/presentation/membership-card-demo-data";

const QUERY_KEY = ["memberships"];

export function useMembershipMembers(params?: GetMembershipMembersParams) {
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
        const service = container.resolve<IMembershipMemberService>(
          "membershipMemberService",
        );
        const result = await service.getAll(params);
        if (result.items.length > 0) return result;
      } catch {
        // Backend may not be ready.
      }
      return getDemoMembershipMembersPage(params);
    },
  });
}

export function useMembershipMember(id: string | null) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: async () => {
      if (!id) return null;
      try {
        const service = container.resolve<IMembershipMemberService>(
          "membershipMemberService",
        );
        const member = await service.getById(id);
        if (member) return member;
      } catch {
        // Backend may not be ready.
      }
      return getDemoMembershipMemberById(id);
    },
    enabled: !!id,
  });
}

function invalidateMembershipQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  id?: string,
) {
  queryClient.invalidateQueries({ queryKey: QUERY_KEY });
  if (id) {
    queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, id] });
  }
}

export function useRegisterMembership() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      data: MembershipRegisterRequest & {
        customerName?: string;
        phone?: string;
        email?: string;
      },
    ) => {
      try {
        const service = container.resolve<IMembershipMemberService>(
          "membershipMemberService",
        );
        return await service.register(data);
      } catch {
        const template = DEMO_MEMBERSHIP_CARD_TEMPLATES.find(
          (t) => t.id === data.cardTemplateId,
        );
        return createDemoMembershipMember({
          ...data,
          customerName: data.customerName,
          phone: data.phone,
          email: data.email,
          cardTemplateName: template?.name,
          tier: template?.tier,
        });
      }
    },
    onSuccess: () => invalidateMembershipQueries(queryClient),
  });
}

export function useMembershipTopup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: MembershipTopupRequest;
    }) => {
      if (isDemoMembershipId(id)) {
        const current = getDemoMembershipMemberById(id);
        if (!current) throw new Error("Membership not found");
        return upsertDemoMembershipMember({
          ...current,
          walletBalance: current.walletBalance + Number(data.amount || 0),
          updatedAt: new Date().toISOString(),
        });
      }
      const service = container.resolve<IMembershipMemberService>(
        "membershipMemberService",
      );
      return service.topup(id, data);
    },
    onSuccess: (_data, vars) => invalidateMembershipQueries(queryClient, vars.id),
  });
}

export function useMembershipRefund() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: MembershipRefundRequest;
    }) => {
      if (isDemoMembershipId(id)) {
        const current = getDemoMembershipMemberById(id);
        if (!current) throw new Error("Membership not found");
        const next = Math.max(0, current.walletBalance - Number(data.amount || 0));
        return upsertDemoMembershipMember({
          ...current,
          walletBalance: next,
          updatedAt: new Date().toISOString(),
        });
      }
      const service = container.resolve<IMembershipMemberService>(
        "membershipMemberService",
      );
      return service.refund(id, data);
    },
    onSuccess: (_data, vars) => invalidateMembershipQueries(queryClient, vars.id),
  });
}

export function useMembershipBindCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: MembershipBindCardRequest;
    }) => {
      if (isDemoMembershipId(id)) {
        const current = getDemoMembershipMemberById(id);
        if (!current) throw new Error("Membership not found");
        return upsertDemoMembershipMember({
          ...current,
          cardNumber: data.cardNumber,
          cardBindStatus: "BOUND",
          updatedAt: new Date().toISOString(),
        });
      }
      const service = container.resolve<IMembershipMemberService>(
        "membershipMemberService",
      );
      return service.bindCard(id, data);
    },
    onSuccess: (_data, vars) => invalidateMembershipQueries(queryClient, vars.id),
  });
}

export function useMembershipUnbindCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (isDemoMembershipId(id)) {
        const current = getDemoMembershipMemberById(id);
        if (!current) throw new Error("Membership not found");
        return upsertDemoMembershipMember({
          ...current,
          cardNumber: null,
          cardBindStatus: "UNBOUND",
          updatedAt: new Date().toISOString(),
        });
      }
      const service = container.resolve<IMembershipMemberService>(
        "membershipMemberService",
      );
      return service.unbindCard(id);
    },
    onSuccess: (_data, id) => invalidateMembershipQueries(queryClient, id),
  });
}

export function useMembershipClose() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (isDemoMembershipId(id)) {
        const current = getDemoMembershipMemberById(id);
        if (!current) throw new Error("Membership not found");
        const now = new Date().toISOString();
        return upsertDemoMembershipMember({
          ...current,
          status: "CLOSED",
          closedAt: now,
          updatedAt: now,
        });
      }
      const service = container.resolve<IMembershipMemberService>(
        "membershipMemberService",
      );
      return service.close(id);
    },
    onSuccess: (_data, id) => invalidateMembershipQueries(queryClient, id),
  });
}
