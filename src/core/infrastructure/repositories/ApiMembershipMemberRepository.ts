import type {
  GetMembershipMembersParams,
  IMembershipMemberRepository,
} from "@/core/domain/repositories/IMembershipMemberRepository";
import type {
  MembershipBindCardRequest,
  MembershipCloseRequest,
  MembershipGuestCard,
  MembershipLedgerEntry,
  MembershipMember,
  MembershipReplaceCardRequest,
  MembershipRefundRequest,
  MembershipRegisterRequest,
  MembershipSettlementQuote,
  MembershipTopupRequest,
  MembershipVoidRequest,
  MembershipWalletAudit,
} from "@/core/domain/entities/MembershipMember";
import type {
  MembershipBindCardDto,
  MembershipCardDto,
  MembershipLedgerEntryDto,
  MembershipMemberDto,
  MembershipRefundDto,
  MembershipRegisterDto,
  MembershipSettlementQuoteDto,
  MembershipSettleDto,
  MembershipTopupDto,
  MembershipWalletAuditDto,
} from "@/core/application/dtos/MembershipMemberDto";
import {
  toMembershipGuestCard,
  toMembershipLedgerEntry,
  toMembershipMember,
  toMembershipSettlementQuote,
  toMembershipWalletAudit,
} from "@/core/application/mappers/MembershipMemberMapper";
import type { PaginatedResult } from "@/core/domain/types/pagination";
import type { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";
import {
  mapPaginatedResult,
  parsePaginatedResponse,
} from "../api/parsePaginatedResponse";

function toApiDecimalStringFixed4(value: unknown): string {
  let n: number;
  if (typeof value === "number" && Number.isFinite(value)) n = value;
  else if (typeof value === "string") n = value.trim() ? Number(value.trim()) : 0;
  else n = NaN;
  if (!Number.isFinite(n)) return "0.0000";
  return n.toFixed(4);
}

function mapWalletPayload(payload: unknown): MembershipMemberDto | null {
  if (!payload || typeof payload !== "object") return null;
  const dto = payload as MembershipMemberDto;
  if (dto.id) return dto;
  if ("data" in (payload as Record<string, unknown>)) {
    const nested = (payload as { data?: MembershipMemberDto }).data;
    if (nested?.id) return nested;
  }
  return null;
}

function mapCardsPayload(payload: unknown): MembershipCardDto[] {
  if (Array.isArray(payload)) return payload as MembershipCardDto[];
  if (payload && typeof payload === "object") {
    const obj = payload as { items?: unknown; data?: unknown };
    if (Array.isArray(obj.items)) return obj.items as MembershipCardDto[];
    if (Array.isArray(obj.data)) return obj.data as MembershipCardDto[];
    const card = payload as MembershipCardDto;
    if (card.id || card.cardUid) return [card];
  }
  return [];
}

function mapSettlementQuotePayload(payload: unknown): MembershipSettlementQuoteDto | null {
  if (!payload || typeof payload !== "object") return null;
  const dto = payload as MembershipSettlementQuoteDto;
  if (dto.walletId) return dto;
  if ("data" in (payload as Record<string, unknown>)) {
    const nested = (payload as { data?: MembershipSettlementQuoteDto }).data;
    if (nested?.walletId) return nested;
  }
  return null;
}

export class ApiMembershipMemberRepository implements IMembershipMemberRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(
    params?: GetMembershipMembersParams,
  ): Promise<PaginatedResult<MembershipMember>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const { data, meta } = await this.httpClient.getPaginated<unknown>(
      API_ENDPOINTS.MEMBERSHIPS.LIST,
      {
        params: {
          page,
          limit,
          ...(params?.search ? { search: params.search } : {}),
          ...(params?.sortBy ? { sortBy: params.sortBy } : {}),
          ...(params?.sortOrder ? { sortOrder: params.sortOrder } : {}),
        },
      },
    );
    const parsed = parsePaginatedResponse<MembershipMemberDto>(
      { data, meta },
      { page, limit },
    );
    return mapPaginatedResult(
      parsed,
      (dto) => toMembershipMember(dto as MembershipMemberDto & { id: string }),
      (dto) => !!dto?.id,
    );
  }

  async getById(id: string): Promise<MembershipMember | null> {
    try {
      const walletRaw = await this.httpClient.get<unknown>(
        API_ENDPOINTS.MEMBERSHIPS.BY_ID(id),
      );
      const walletDto = mapWalletPayload(walletRaw);
      if (!walletDto?.id) return null;
      const cardsRaw = await this.httpClient.get<unknown>(
        API_ENDPOINTS.MEMBERSHIPS.CARDS(id),
      );
      const dto: MembershipMemberDto = {
        ...walletDto,
        cards: mapCardsPayload(cardsRaw),
      };
      return toMembershipMember(dto as MembershipMemberDto & { id: string });
    } catch {
      return null;
    }
  }

  async register(data: MembershipRegisterRequest): Promise<MembershipMember> {
    const body: MembershipRegisterDto = {
      tierId: data.tierId ?? data.cardTemplateId ?? "",
      guestName: data.customerName ?? "",
      guestPhone: data.phone ?? "",
      guestIdNumber: data.guestIdNumber,
      locationId: data.locationId,
      posSessionId: data.posSessionId,
      cards: data.cards,
      payment: {
        paymentMethodId: data.payment.paymentMethodId,
        amount: toApiDecimalStringFixed4(data.payment.amount),
        ...(data.payment.reference ? { reference: data.payment.reference } : {}),
      },
      ...(data.idempotencyKey ? { idempotencyKey: data.idempotencyKey } : {}),
    };
    const raw = await this.httpClient.post<unknown>(
      API_ENDPOINTS.MEMBERSHIPS.REGISTER,
      body,
    );
    const dto = mapWalletPayload(raw);
    if (!dto?.id) throw new Error("Register membership response missing id");
    return toMembershipMember(dto as MembershipMemberDto & { id: string });
  }

  async topup(id: string, data: MembershipTopupRequest): Promise<MembershipMember> {
    const body: MembershipTopupDto = {
      amount: toApiDecimalStringFixed4(data.amount),
      paymentMethodId: data.paymentMethodId,
      posSessionId: data.posSessionId,
      locationId: data.locationId,
      ...(data.reference ? { reference: data.reference } : {}),
      ...(data.guestCardId ? { guestCardId: data.guestCardId } : {}),
      ...(data.idempotencyKey ? { idempotencyKey: data.idempotencyKey } : {}),
      ...(data.notes ? { notes: data.notes } : {}),
    };
    await this.httpClient.post<unknown>(
      API_ENDPOINTS.MEMBERSHIPS.TOPUP(id),
      body,
    );
    const refreshed = await this.getById(id);
    if (!refreshed) throw new Error("Membership not found after topup");
    return refreshed;
  }

  async refund(id: string, data: MembershipRefundRequest): Promise<MembershipMember> {
    const body: MembershipRefundDto = {
      amount: toApiDecimalStringFixed4(data.amount),
      paymentMethodId: data.paymentMethodId,
      posSessionId: data.posSessionId,
      locationId: data.locationId,
      ...(data.reference ? { reference: data.reference } : {}),
      ...(data.idempotencyKey ? { idempotencyKey: data.idempotencyKey } : {}),
      ...(data.notes ? { notes: data.notes } : {}),
    };
    await this.httpClient.post<unknown>(API_ENDPOINTS.MEMBERSHIPS.REFUND(id), body, {
      headers: { "x-approver-authorization": data.approverAuthorization },
    });
    const refreshed = await this.getById(id);
    if (!refreshed) throw new Error("Membership not found after refund");
    return refreshed;
  }

  async bindCard(
    id: string,
    data: MembershipBindCardRequest,
  ): Promise<MembershipMember> {
    const body: MembershipBindCardDto = {
      walletId: id,
      cardUid: data.cardUid,
      ...(data.label ? { label: data.label } : {}),
      ...(data.roomNumber ? { roomNumber: data.roomNumber } : {}),
    };
    await this.httpClient.post<unknown>(
      API_ENDPOINTS.GUEST_CARDS.CREATE,
      body,
    );
    const refreshed = await this.getById(id);
    if (!refreshed) throw new Error("Membership not found after bind card");
    return refreshed;
  }

  async unbindCard(id: string, cardId?: string): Promise<MembershipMember> {
    let targetId = cardId;
    if (!targetId) {
      const cardsRaw = await this.httpClient.get<unknown>(
        API_ENDPOINTS.MEMBERSHIPS.CARDS(id),
      );
      const cards = mapCardsPayload(cardsRaw);
      const active = cards.find((card) => {
        const status = String(card.status ?? "").toUpperCase();
        return status !== "DEACTIVATED" && status !== "LOST";
      });
      targetId = active?.id;
    }
    if (!targetId) {
      throw new Error("No active card found for this wallet.");
    }
    await this.httpClient.delete(API_ENDPOINTS.GUEST_CARDS.DELETE(targetId));
    const refreshed = await this.getById(id);
    if (!refreshed) throw new Error("Membership not found after unbind card");
    return refreshed;
  }

  async getSettlementQuote(id: string): Promise<MembershipSettlementQuote | null> {
    try {
      const raw = await this.httpClient.get<unknown>(
        API_ENDPOINTS.MEMBERSHIPS.SETTLEMENT_QUOTE(id),
      );
      const dto = mapSettlementQuotePayload(raw);
      return dto ? toMembershipSettlementQuote(dto) : null;
    } catch {
      return null;
    }
  }

  async beginSettlement(id: string): Promise<MembershipMember> {
    await this.httpClient.post(API_ENDPOINTS.MEMBERSHIPS.BEGIN_SETTLEMENT(id));
    const refreshed = await this.getById(id);
    if (!refreshed) throw new Error("Membership not found after begin settlement");
    return refreshed;
  }

  async cancelSettlement(id: string): Promise<MembershipMember> {
    await this.httpClient.post(API_ENDPOINTS.MEMBERSHIPS.CANCEL_SETTLEMENT(id));
    const refreshed = await this.getById(id);
    if (!refreshed) throw new Error("Membership not found after cancel settlement");
    return refreshed;
  }

  async close(id: string, data: MembershipCloseRequest): Promise<MembershipMember> {
    const body: MembershipSettleDto = {
      posSessionId: data.posSessionId,
      locationId: data.locationId,
      ...(data.refund
        ? {
            refund: {
              paymentMethodId: data.refund.paymentMethodId,
              ...(data.refund.reference ? { reference: data.refund.reference } : {}),
            },
          }
        : {}),
      ...(data.collect
        ? {
            collect: {
              paymentMethodId: data.collect.paymentMethodId,
              ...(data.collect.reference ? { reference: data.collect.reference } : {}),
              ...(data.collect.amount != null
                ? { amount: toApiDecimalStringFixed4(data.collect.amount) }
                : {}),
            },
          }
        : {}),
      ...(data.idempotencyKey ? { idempotencyKey: data.idempotencyKey } : {}),
      ...(data.notes ? { notes: data.notes } : {}),
    };
    await this.httpClient.post(API_ENDPOINTS.MEMBERSHIPS.CLOSE(id), body, {
      headers: { "x-approver-authorization": data.approverAuthorization },
    });
    const refreshed = await this.getById(id);
    if (!refreshed) throw new Error("Membership not found after settle");
    return refreshed;
  }

  async voidWallet(id: string, data: MembershipVoidRequest): Promise<MembershipMember> {
    await this.httpClient.post(API_ENDPOINTS.MEMBERSHIPS.VOID(id), undefined, {
      headers: { "x-approver-authorization": data.approverAuthorization },
    });
    const refreshed = await this.getById(id);
    if (!refreshed) throw new Error("Membership not found after void");
    return refreshed;
  }

  async getCards(id: string): Promise<MembershipGuestCard[]> {
    const raw = await this.httpClient.get<unknown>(API_ENDPOINTS.MEMBERSHIPS.CARDS(id));
    return mapCardsPayload(raw)
      .filter((card) => Boolean(card?.id || card?.cardUid))
      .map((card) => toMembershipGuestCard(card));
  }

  async getAllGuestCards(
    params?: GetMembershipMembersParams,
  ): Promise<PaginatedResult<MembershipGuestCard>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const { data, meta } = await this.httpClient.getPaginated<unknown>(
      API_ENDPOINTS.GUEST_CARDS.LIST,
      {
        params: {
          page,
          limit,
          ...(params?.search ? { search: params.search } : {}),
          ...(params?.sortBy ? { sortBy: params.sortBy } : {}),
          ...(params?.sortOrder ? { sortOrder: params.sortOrder } : {}),
        },
      },
    );
    const parsed = parsePaginatedResponse<MembershipCardDto>(
      { data, meta },
      { page, limit },
    );
    return mapPaginatedResult(
      parsed,
      (dto) => toMembershipGuestCard(dto),
      (dto) => Boolean(dto?.id || dto?.cardUid),
    );
  }

  async getGuestCardById(id: string): Promise<MembershipGuestCard | null> {
    try {
      const raw = await this.httpClient.get<unknown>(API_ENDPOINTS.GUEST_CARDS.BY_ID(id));
      const cards = mapCardsPayload(raw);
      const card = cards[0];
      return card ? toMembershipGuestCard(card) : null;
    } catch {
      return null;
    }
  }

  async lookupCard(cardUid: string): Promise<MembershipGuestCard | null> {
    try {
      const raw = await this.httpClient.get<unknown>(API_ENDPOINTS.GUEST_CARDS.LOOKUP, {
        params: { cardUid },
      });
      const cards = mapCardsPayload(raw);
      const card = cards[0];
      return card ? toMembershipGuestCard(card) : null;
    } catch {
      return null;
    }
  }

  async getLedger(
    id: string,
    params?: GetMembershipMembersParams,
  ): Promise<PaginatedResult<MembershipLedgerEntry>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    const { data, meta } = await this.httpClient.getPaginated<unknown>(
      API_ENDPOINTS.MEMBERSHIPS.LEDGER(id),
      {
        params: {
          page,
          limit,
          ...(params?.search ? { search: params.search } : {}),
          ...(params?.sortBy ? { sortBy: params.sortBy } : {}),
          ...(params?.sortOrder ? { sortOrder: params.sortOrder } : {}),
        },
      },
    );
    const parsed = parsePaginatedResponse<MembershipLedgerEntryDto>(
      { data, meta },
      { page, limit },
    );
    return mapPaginatedResult(parsed, toMembershipLedgerEntry, (dto) => Boolean(dto?.id));
  }

  async getAudit(id: string): Promise<MembershipWalletAudit | null> {
    try {
      const raw = await this.httpClient.get<unknown>(API_ENDPOINTS.MEMBERSHIPS.AUDIT(id));
      if (!raw || typeof raw !== "object") return { raw };
      return toMembershipWalletAudit(raw as MembershipWalletAuditDto);
    } catch {
      return null;
    }
  }

  async reportLostCard(walletId: string, cardId: string): Promise<MembershipMember> {
    await this.httpClient.post(API_ENDPOINTS.GUEST_CARDS.REPORT_LOST(cardId));
    const refreshed = await this.getById(walletId);
    if (!refreshed) throw new Error("Membership not found after reporting lost card");
    return refreshed;
  }

  async replaceCard(
    walletId: string,
    cardId: string,
    data: MembershipReplaceCardRequest,
  ): Promise<MembershipMember> {
    await this.httpClient.post(API_ENDPOINTS.GUEST_CARDS.REPLACE(cardId), data);
    const refreshed = await this.getById(walletId);
    if (!refreshed) throw new Error("Membership not found after replacing card");
    return refreshed;
  }
}
