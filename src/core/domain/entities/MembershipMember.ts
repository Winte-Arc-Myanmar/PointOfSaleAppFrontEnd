/**
 * Membership member (customer membership account with optional physical/virtual card).
 * Domain layer - no framework dependencies.
 */

import type { Id } from "@/core/domain/types";

export type MembershipMemberStatus = "ACTIVE" | "CLOSED" | "SUSPENDED" | string;
export type MembershipCardBindStatus = "BOUND" | "UNBOUND" | string;
export type MembershipGuestCardStatus = "ACTIVE" | "LOST" | "DEACTIVATED" | string;

export interface MembershipGuestCard {
  id: string;
  tenantId: string;
  walletId: string;
  cardUid: string;
  label?: string | null;
  roomNumber?: string | null;
  status: MembershipGuestCardStatus;
  issuedAt?: string | null;
  issuedByUserId?: string | null;
  deactivatedAt?: string | null;
  replacedByCardId?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface MembershipSettlementBlocker {
  type: string;
  id: string;
  label: string;
}

export interface MembershipSettlementQuote {
  walletId: string;
  walletNumber: string;
  guestName: string;
  status: string;
  balance: number;
  purchasedBalance: number;
  grantedBalance: number;
  action: string;
  refundable: number;
  forfeitable: number;
  collectable: number;
  blockers: MembershipSettlementBlocker[];
}

export interface MembershipMember {
  id: Id;
  tenantId: string;
  customerId: string;
  customerName: string;
  phone: string;
  email: string;
  walletNumber?: string;
  guestIdNumber?: string | null;
  cardTemplateId: string;
  cardTemplateName: string;
  tier: string;
  cardNumber: string | null;
  cardBindStatus: MembershipCardBindStatus;
  walletBalance: number;
  purchasedBalance?: number;
  grantedBalance?: number;
  discountBpsSnapshot?: number;
  isPostpaidSnapshot?: boolean;
  preloadAmountSnapshot?: number;
  preloadFundingSnapshot?: string;
  sequenceNo?: number;
  issuedAtLocationId?: string;
  issuedByUserId?: string;
  closedByUserId?: string | null;
  expiresAt?: string | null;
  primaryCardId?: string | null;
  cardLabel?: string | null;
  cardRoomNumber?: string | null;
  status: MembershipMemberStatus;
  registeredAt: string;
  openedAt?: string | null;
  closedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface MembershipTopupRequest {
  amount: number;
  paymentMethodId: string;
  posSessionId: string;
  locationId: string;
  reference?: string;
  guestCardId?: string;
  idempotencyKey?: string;
  notes?: string;
}

export interface MembershipRefundRequest {
  amount: number;
  paymentMethodId: string;
  posSessionId: string;
  locationId: string;
  reference?: string;
  idempotencyKey?: string;
  notes?: string;
  approverAuthorization: string;
}

export interface MembershipBindCardRequest {
  cardUid: string;
  label?: string;
  roomNumber?: string;
}

export interface MembershipReplaceCardRequest {
  newCardUid: string;
  label?: string;
  roomNumber?: string;
}

export interface MembershipRegisterRequest {
  tenantId: string;
  customerId?: string;
  cardTemplateId?: string;
  tierId?: string;
  customerName?: string;
  phone?: string;
  guestIdNumber?: string;
  locationId: string;
  posSessionId: string;
  cards: Array<{
    cardUid: string;
    label?: string;
    roomNumber?: string;
  }>;
  payment: {
    paymentMethodId: string;
    amount: number;
    reference?: string;
  };
  idempotencyKey?: string;
}

export interface MembershipLedgerEntry {
  id: string;
  tenantId: string;
  walletId: string;
  sequenceNo: number;
  entryType: string;
  amount: number;
  purchasedDelta: number;
  grantedDelta: number;
  balanceAfter: number;
  guestCardId?: string | null;
  locationId?: string | null;
  posSessionId?: string | null;
  staffUserId?: string | null;
  approvedByUserId?: string | null;
  sourceModule?: string | null;
  sourceRecordId?: string | null;
  correctsEntryId?: string | null;
  reference?: string | null;
  idempotencyKey?: string | null;
  businessDate?: string | null;
  notes?: string | null;
  createdAt?: string | null;
}

export interface MembershipWalletAudit {
  walletId?: string;
  balanced?: boolean;
  storedBalance?: number;
  replayedBalance?: number;
  drift?: number;
  message?: string;
  raw?: unknown;
}

export interface MembershipVoidRequest {
  approverAuthorization: string;
}

export interface MembershipCloseRequest {
  posSessionId: string;
  locationId: string;
  idempotencyKey?: string;
  notes?: string;
  approverAuthorization: string;
  refund?: {
    paymentMethodId: string;
    reference?: string;
  };
  collect?: {
    paymentMethodId: string;
    reference?: string;
    amount?: number;
  };
}
