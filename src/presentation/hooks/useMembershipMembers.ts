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

const QUERY_KEY = ["memberships"];

const service = () =>
  container.resolve<IMembershipMemberService>("membershipMemberService");

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
    queryFn: () => service().getAll(params),
  });
}

export function useMembershipMember(id: string | null) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => (id ? service().getById(id) : null),
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
    mutationFn: (data: MembershipRegisterRequest) => service().register(data),
    onSuccess: () => invalidateMembershipQueries(queryClient),
  });
}

export function useMembershipTopup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MembershipTopupRequest }) =>
      service().topup(id, data),
    onSuccess: (_data, vars) => invalidateMembershipQueries(queryClient, vars.id),
  });
}

export function useMembershipRefund() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MembershipRefundRequest }) =>
      service().refund(id, data),
    onSuccess: (_data, vars) => invalidateMembershipQueries(queryClient, vars.id),
  });
}

export function useMembershipBindCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MembershipBindCardRequest }) =>
      service().bindCard(id, data),
    onSuccess: (_data, vars) => invalidateMembershipQueries(queryClient, vars.id),
  });
}

export function useMembershipUnbindCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, cardId }: { id: string; cardId?: string }) =>
      service().unbindCard(id, cardId),
    onSuccess: (_data, vars) => invalidateMembershipQueries(queryClient, vars.id),
  });
}

export function useMembershipClose() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MembershipCloseRequest }) =>
      service().close(id, data),
    onSuccess: (_data, vars) => invalidateMembershipQueries(queryClient, vars.id),
  });
}

export function useMembershipCards(id: string | null) {
  return useQuery({
    queryKey: [...QUERY_KEY, id, "cards"],
    queryFn: () => (id ? service().getCards(id) : ([] as MembershipGuestCard[])),
    enabled: !!id,
  });
}

export function useMembershipSettlementQuote(id: string | null) {
  return useQuery({
    queryKey: [...QUERY_KEY, id, "settlement-quote"],
    queryFn: () =>
      id ? service().getSettlementQuote(id) : (null as MembershipSettlementQuote | null),
    enabled: !!id,
  });
}

export function useMembershipBeginSettlement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => service().beginSettlement(id),
    onSuccess: (_data, id) => invalidateMembershipQueries(queryClient, id),
  });
}

export function useMembershipCancelSettlement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => service().cancelSettlement(id),
    onSuccess: (_data, id) => invalidateMembershipQueries(queryClient, id),
  });
}

export function useMembershipReportLostCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ walletId, cardId }: { walletId: string; cardId: string }) =>
      service().reportLostCard(walletId, cardId),
    onSuccess: (_data, vars) => invalidateMembershipQueries(queryClient, vars.walletId),
  });
}

export function useMembershipReplaceCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      walletId,
      cardId,
      data,
    }: {
      walletId: string;
      cardId: string;
      data: MembershipReplaceCardRequest;
    }) => service().replaceCard(walletId, cardId, data),
    onSuccess: (_data, vars) => invalidateMembershipQueries(queryClient, vars.walletId),
  });
}

export function useMembershipCardLookup() {
  return useMutation({
    mutationFn: (cardUid: string) => service().lookupCard(cardUid),
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
    queryFn: () =>
      id
        ? service().getLedger(id, { page, limit, search, sortBy, sortOrder })
        : { items: [] as MembershipLedgerEntry[], total: 0, page, limit },
    enabled: !!id,
  });
}

export function useMembershipAudit(id: string | null) {
  return useQuery({
    queryKey: [...QUERY_KEY, id, "audit"],
    queryFn: () => (id ? service().getAudit(id) : (null as MembershipWalletAudit | null)),
    enabled: !!id,
  });
}

export function useMembershipVoid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MembershipVoidRequest }) =>
      service().voidWallet(id, data),
    onSuccess: (_data, vars) => invalidateMembershipQueries(queryClient, vars.id),
  });
}
