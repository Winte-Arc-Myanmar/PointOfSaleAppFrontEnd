import type {
  MembershipGuestCard,
  MembershipLedgerEntry,
  MembershipMember,
  MembershipSettlementQuote,
  MembershipWalletAudit,
} from "@/core/domain/entities/MembershipMember";
import type {
  MembershipCardDto,
  MembershipLedgerEntryDto,
  MembershipMemberDto,
  MembershipSettlementQuoteDto,
  MembershipWalletAuditDto,
} from "../dtos/MembershipMemberDto";

function parseDecimal(val: unknown): number {
  if (typeof val === "number" && Number.isFinite(val)) return val;
  if (typeof val === "string") {
    const n = Number(val.trim());
    return Number.isFinite(n) ? n : 0;
  }
  return Number(val) || 0;
}

export function toMembershipMember(
  dto: MembershipMemberDto & { id: string },
): MembershipMember {
  const firstCard = Array.isArray(dto.cards) ? dto.cards[0] : undefined;
  const tierName = dto.tierNameSnapshot ?? dto.tier ?? dto.cardTemplate?.tier ?? "BRONZE";
  return {
    id: dto.id,
    tenantId: dto.tenantId ?? "",
    customerId: dto.customerId ?? dto.customer?.id ?? "",
    customerName: dto.customerName ?? dto.customer?.name ?? dto.guestName ?? "",
    phone: dto.phone ?? dto.customer?.phone ?? dto.guestPhone ?? "",
    email: dto.email ?? dto.customer?.email ?? "",
    walletNumber: dto.walletNumber,
    guestIdNumber: dto.guestIdNumber ?? null,
    cardTemplateId: dto.cardTemplateId ?? dto.tierId ?? dto.cardTemplate?.id ?? "",
    cardTemplateName: dto.cardTemplateName ?? dto.tierNameSnapshot ?? dto.cardTemplate?.name ?? "",
    tier: tierName,
    cardNumber: dto.cardNumber ?? firstCard?.cardUid ?? null,
    cardBindStatus:
      dto.cardBindStatus ??
      ((dto.cardNumber ?? firstCard?.cardUid) ? "BOUND" : "UNBOUND"),
    walletBalance: parseDecimal(dto.walletBalance ?? dto.balance),
    purchasedBalance: parseDecimal(dto.purchasedBalance),
    grantedBalance: parseDecimal(dto.grantedBalance),
    discountBpsSnapshot: Number(dto.discountBpsSnapshot ?? 0),
    isPostpaidSnapshot: Boolean(dto.isPostpaidSnapshot),
    preloadAmountSnapshot: parseDecimal(dto.preloadAmountSnapshot),
    preloadFundingSnapshot: dto.preloadFundingSnapshot ?? "",
    sequenceNo: dto.sequenceNo,
    issuedAtLocationId: dto.issuedAtLocationId,
    issuedByUserId: dto.issuedByUserId,
    closedByUserId: dto.closedByUserId ?? null,
    expiresAt: dto.expiresAt ?? null,
    primaryCardId: firstCard?.id ?? null,
    cardLabel: firstCard?.label ?? null,
    cardRoomNumber: firstCard?.roomNumber ?? null,
    status: dto.status ?? "ACTIVE",
    registeredAt:
      dto.registeredAt ??
      dto.openedAt ??
      dto.createdAt ??
      new Date().toISOString(),
    openedAt: dto.openedAt ?? null,
    closedAt: dto.closedAt ?? null,
    createdAt: dto.createdAt ?? null,
    updatedAt: dto.updatedAt ?? null,
  };
}

export function toMembershipGuestCard(dto: MembershipCardDto): MembershipGuestCard {
  return {
    id: dto.id ?? "",
    tenantId: dto.tenantId ?? "",
    walletId: dto.walletId ?? "",
    cardUid: dto.cardUid ?? "",
    label: dto.label ?? null,
    roomNumber: dto.roomNumber ?? null,
    status: dto.status ?? "ACTIVE",
    issuedAt: dto.issuedAt ?? null,
    issuedByUserId: dto.issuedByUserId ?? null,
    deactivatedAt: dto.deactivatedAt ?? null,
    replacedByCardId: dto.replacedByCardId ?? null,
    createdAt: dto.createdAt ?? null,
    updatedAt: dto.updatedAt ?? null,
  };
}

export function toMembershipSettlementQuote(
  dto: MembershipSettlementQuoteDto,
): MembershipSettlementQuote {
  return {
    walletId: dto.walletId ?? "",
    walletNumber: dto.walletNumber ?? "",
    guestName: dto.guestName ?? "",
    status: dto.status ?? "",
    balance: parseDecimal(dto.balance),
    purchasedBalance: parseDecimal(dto.purchasedBalance),
    grantedBalance: parseDecimal(dto.grantedBalance),
    action: dto.action ?? "",
    refundable: parseDecimal(dto.refundable),
    forfeitable: parseDecimal(dto.forfeitable),
    collectable: parseDecimal(dto.collectable),
    blockers: (dto.blockers ?? []).map((b) => ({
      type: b.type ?? "",
      id: b.id ?? "",
      label: b.label ?? "",
    })),
  };
}

export function toMembershipLedgerEntry(
  dto: MembershipLedgerEntryDto,
): MembershipLedgerEntry {
  return {
    id: dto.id ?? "",
    tenantId: dto.tenantId ?? "",
    walletId: dto.walletId ?? "",
    sequenceNo: Number(dto.sequenceNo ?? 0),
    entryType: dto.entryType ?? "",
    amount: parseDecimal(dto.amount),
    purchasedDelta: parseDecimal(dto.purchasedDelta),
    grantedDelta: parseDecimal(dto.grantedDelta),
    balanceAfter: parseDecimal(dto.balanceAfter),
    guestCardId: dto.guestCardId ?? null,
    locationId: dto.locationId ?? null,
    posSessionId: dto.posSessionId ?? null,
    staffUserId: dto.staffUserId ?? null,
    approvedByUserId: dto.approvedByUserId ?? null,
    sourceModule: dto.sourceModule ?? null,
    sourceRecordId: dto.sourceRecordId ?? null,
    correctsEntryId: dto.correctsEntryId ?? null,
    reference: dto.reference ?? null,
    idempotencyKey: dto.idempotencyKey ?? null,
    businessDate: dto.businessDate ?? null,
    notes: dto.notes ?? null,
    createdAt: dto.createdAt ?? null,
  };
}

export function toMembershipWalletAudit(
  dto: MembershipWalletAuditDto,
): MembershipWalletAudit {
  return {
    walletId: dto.walletId,
    balanced: dto.balanced,
    storedBalance:
      dto.storedBalance == null ? undefined : parseDecimal(dto.storedBalance),
    replayedBalance:
      dto.replayedBalance == null ? undefined : parseDecimal(dto.replayedBalance),
    drift: dto.drift == null ? undefined : parseDecimal(dto.drift),
    message: dto.message,
    raw: dto,
  };
}
