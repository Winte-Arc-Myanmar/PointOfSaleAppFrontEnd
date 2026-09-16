"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { IMembershipMemberService } from "@/core/domain/services/IMembershipMemberService";
import type { GetMembershipMembersParams } from "@/core/domain/repositories/IMembershipMemberRepository";
import type {
  MembershipBindCardRequest,
  MembershipCloseRequest,
  MembershipGuestCard,
  MembershipLedgerEntry,
  MembershipRefundRequest,
  MembershipRegisterRequest,
  MembershipReplaceCardRequest,
  MembershipSettlementQuote,
  MembershipTopupRequest,
  MembershipVoidRequest,
  MembershipWalletAudit,
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
  queryClient.invalidateQueries({ queryKey: ["guest-cards"] });
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
        cardTemplateName?: string;
        tier?: string;
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
          tenantId: data.tenantId,
          customerId: data.customerId ?? data.guestIdNumber ?? `guest-${Date.now()}`,
          cardTemplateId: data.tierId ?? data.cardTemplateId ?? "",
          cardNumber: data.cards?.[0]?.cardUid ?? null,
          initialTopup: data.payment?.amount ?? 0,
          customerName: data.customerName,
          phone: data.phone,
          email: data.email,
          cardTemplateName: data.cardTemplateName ?? template?.name,
          tier: data.tier ?? template?.tier,
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
          purchasedBalance:
            (current.purchasedBalance ?? current.walletBalance) + Number(data.amount || 0),
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
          purchasedBalance: Math.max(
            0,
            (current.purchasedBalance ?? current.walletBalance) - Number(data.amount || 0),
          ),
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
          cardNumber: data.cardUid,
          cardLabel: data.label ?? null,
          cardRoomNumber: data.roomNumber ?? null,
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
    mutationFn: async ({ id, cardId }: { id: string; cardId?: string }) => {
      if (isDemoMembershipId(id)) {
        const current = getDemoMembershipMemberById(id);
        if (!current) throw new Error("Membership not found");
        return upsertDemoMembershipMember({
          ...current,
          cardNumber: null,
          cardLabel: null,
          cardRoomNumber: null,
          cardBindStatus: "UNBOUND",
          updatedAt: new Date().toISOString(),
        });
      }
      const service = container.resolve<IMembershipMemberService>(
        "membershipMemberService",
      );
      return service.unbindCard(id, cardId);
    },
    onSuccess: (_data, vars) => invalidateMembershipQueries(queryClient, vars.id),
  });
}

export function useMembershipClose() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: MembershipCloseRequest;
    }) => {
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
      return service.close(id, data);
    },
    onSuccess: (_data, vars) => invalidateMembershipQueries(queryClient, vars.id),
  });
}

export function useMembershipCards(id: string | null) {
  return useQuery({
    queryKey: [...QUERY_KEY, id, "cards"],
    queryFn: async () => {
      if (!id) return [] as MembershipGuestCard[];
      if (isDemoMembershipId(id)) {
        const current = getDemoMembershipMemberById(id);
        if (!current?.cardNumber) return [];
        return [
          {
            id: current.primaryCardId ?? `${id}-card`,
            tenantId: current.tenantId,
            walletId: id,
            cardUid: current.cardNumber,
            label: current.cardLabel ?? null,
            roomNumber: current.cardRoomNumber ?? null,
            status: "ACTIVE",
            issuedAt: current.registeredAt,
            issuedByUserId: null,
            deactivatedAt: null,
            replacedByCardId: null,
            createdAt: current.createdAt ?? null,
            updatedAt: current.updatedAt ?? null,
          },
        ];
      }
      const service = container.resolve<IMembershipMemberService>("membershipMemberService");
      return service.getCards(id);
    },
    enabled: !!id,
  });
}

export function useMembershipSettlementQuote(id: string | null) {
  return useQuery({
    queryKey: [...QUERY_KEY, id, "settlement-quote"],
    queryFn: async () => {
      if (!id) return null as MembershipSettlementQuote | null;
      if (isDemoMembershipId(id)) {
        const current = getDemoMembershipMemberById(id);
        if (!current) return null;
        return {
          walletId: id,
          walletNumber: current.walletNumber ?? String(current.id),
          guestName: current.customerName,
          status: current.status,
          balance: current.walletBalance,
          purchasedBalance: current.purchasedBalance ?? current.walletBalance,
          grantedBalance: current.grantedBalance ?? 0,
          action: current.walletBalance > 0 ? "REFUND_DUE" : "CAN_CLOSE",
          refundable: Math.max(0, current.purchasedBalance ?? current.walletBalance),
          forfeitable: Math.max(0, current.grantedBalance ?? 0),
          collectable: 0,
          blockers: [],
        };
      }
      const service = container.resolve<IMembershipMemberService>("membershipMemberService");
      return service.getSettlementQuote(id);
    },
    enabled: !!id,
  });
}

export function useMembershipBeginSettlement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (isDemoMembershipId(id)) return getDemoMembershipMemberById(id);
      const service = container.resolve<IMembershipMemberService>("membershipMemberService");
      return service.beginSettlement(id);
    },
    onSuccess: (_data, id) => invalidateMembershipQueries(queryClient, id),
  });
}

export function useMembershipCancelSettlement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (isDemoMembershipId(id)) return getDemoMembershipMemberById(id);
      const service = container.resolve<IMembershipMemberService>("membershipMemberService");
      return service.cancelSettlement(id);
    },
    onSuccess: (_data, id) => invalidateMembershipQueries(queryClient, id),
  });
}

export function useMembershipReportLostCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ walletId, cardId }: { walletId: string; cardId: string }) => {
      if (isDemoMembershipId(walletId)) {
        const current = getDemoMembershipMemberById(walletId);
        if (!current) throw new Error("Membership not found");
        return upsertDemoMembershipMember({
          ...current,
          cardBindStatus: "UNBOUND",
          cardNumber: null,
          cardLabel: null,
          cardRoomNumber: null,
          updatedAt: new Date().toISOString(),
        });
      }
      const service = container.resolve<IMembershipMemberService>("membershipMemberService");
      return service.reportLostCard(walletId, cardId);
    },
    onSuccess: (_data, vars) => invalidateMembershipQueries(queryClient, vars.walletId),
  });
}

export function useMembershipReplaceCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      walletId,
      cardId,
      data,
    }: {
      walletId: string;
      cardId: string;
      data: MembershipReplaceCardRequest;
    }) => {
      if (isDemoMembershipId(walletId)) {
        const current = getDemoMembershipMemberById(walletId);
        if (!current) throw new Error("Membership not found");
        return upsertDemoMembershipMember({
          ...current,
          cardNumber: data.newCardUid,
          cardLabel: data.label ?? current.cardLabel ?? null,
          cardRoomNumber: data.roomNumber ?? current.cardRoomNumber ?? null,
          cardBindStatus: "BOUND",
          updatedAt: new Date().toISOString(),
        });
      }
      const service = container.resolve<IMembershipMemberService>("membershipMemberService");
      return service.replaceCard(walletId, cardId, data);
    },
    onSuccess: (_data, vars) => invalidateMembershipQueries(queryClient, vars.walletId),
  });
}

export function useMembershipCardLookup() {
  return useMutation({
    mutationFn: async (cardUid: string) => {
      const service = container.resolve<IMembershipMemberService>("membershipMemberService");
      const card = await service.lookupCard(cardUid);
      if (card) return card;
      const demo = getDemoMembershipMembersPage({ page: 1, limit: 200 }).items.find(
        (item) => item.cardNumber?.toLowerCase() === cardUid.trim().toLowerCase(),
      );
      if (!demo?.cardNumber) return null;
      return {
        id: demo.primaryCardId ?? `${demo.id}-card`,
        tenantId: demo.tenantId,
        walletId: String(demo.id),
        cardUid: demo.cardNumber,
        label: demo.cardLabel ?? null,
        roomNumber: demo.cardRoomNumber ?? null,
        status: "ACTIVE",
        issuedAt: demo.registeredAt,
        issuedByUserId: null,
        deactivatedAt: null,
        replacedByCardId: null,
        createdAt: demo.createdAt ?? null,
        updatedAt: demo.updatedAt ?? null,
      } satisfies MembershipGuestCard;
    },
  });
}

export function useMembershipLedger(
  id: string | null,
  params?: GetMembershipMembersParams,
) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;
  const search = params?.search;
  const sortBy = params?.sortBy ?? "createdAt";
  const sortOrder = params?.sortOrder ?? "desc";

  return useQuery({
    queryKey: [...QUERY_KEY, id, "ledger", page, limit, search, sortBy, sortOrder],
    queryFn: async () => {
      if (!id) {
        return { items: [] as MembershipLedgerEntry[], total: 0, page, limit };
      }
      if (isDemoMembershipId(id)) {
        const current = getDemoMembershipMemberById(id);
        if (!current) {
          return { items: [] as MembershipLedgerEntry[], total: 0, page, limit };
        }
        return {
          items: [
            {
              id: `${id}-open`,
              tenantId: current.tenantId,
              walletId: id,
              sequenceNo: 1,
              entryType: "ISSUE",
              amount: current.walletBalance,
              purchasedDelta: current.purchasedBalance ?? current.walletBalance,
              grantedDelta: current.grantedBalance ?? 0,
              balanceAfter: current.walletBalance,
              notes: "Demo opening balance",
              createdAt: current.registeredAt,
            },
          ] satisfies MembershipLedgerEntry[],
          total: 1,
          page,
          limit,
        };
      }
      const service = container.resolve<IMembershipMemberService>("membershipMemberService");
      return service.getLedger(id, {
        page,
        limit,
        search,
        sortBy,
        sortOrder,
      });
    },
    enabled: !!id,
  });
}

export function useMembershipAudit(id: string | null) {
  return useQuery({
    queryKey: [...QUERY_KEY, id, "audit"],
    queryFn: async () => {
      if (!id) return null as MembershipWalletAudit | null;
      if (isDemoMembershipId(id)) {
        const current = getDemoMembershipMemberById(id);
        if (!current) return null;
        return {
          walletId: id,
          balanced: true,
          storedBalance: current.walletBalance,
          replayedBalance: current.walletBalance,
          drift: 0,
          message: "Demo ledger matches stored balance.",
        } satisfies MembershipWalletAudit;
      }
      const service = container.resolve<IMembershipMemberService>("membershipMemberService");
      return service.getAudit(id);
    },
    enabled: !!id,
  });
}

export function useMembershipVoid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: MembershipVoidRequest;
    }) => {
      if (isDemoMembershipId(id)) {
        const current = getDemoMembershipMemberById(id);
        if (!current) throw new Error("Membership not found");
        const now = new Date().toISOString();
        return upsertDemoMembershipMember({
          ...current,
          status: "VOIDED",
          closedAt: now,
          updatedAt: now,
        });
      }
      const service = container.resolve<IMembershipMemberService>("membershipMemberService");
      return service.voidWallet(id, data);
    },
    onSuccess: (_data, vars) => invalidateMembershipQueries(queryClient, vars.id),
  });
}
