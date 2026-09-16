/**
 * Membership member DTOs.
 * Application layer - matches backend contract.
 */

export interface MembershipMemberDto {
  id?: string;
  tenantId: string;
  customerId?: string;
  customerName?: string;
  phone?: string;
  email?: string;
  guestName?: string;
  guestPhone?: string;
  walletNumber?: string;
  guestIdNumber?: string | null;
  cardTemplateId?: string;
  cardTemplateName?: string;
  tier?: string;
  tierId?: string;
  tierNameSnapshot?: string;
  discountBpsSnapshot?: number | string;
  isPostpaidSnapshot?: boolean;
  preloadAmountSnapshot?: number | string;
  preloadFundingSnapshot?: string;
  cardNumber?: string | null;
  cardBindStatus?: string;
  walletBalance?: number | string;
  balance?: number | string;
  purchasedBalance?: number | string;
  grantedBalance?: number | string;
  sequenceNo?: number;
  issuedAtLocationId?: string;
  issuedByUserId?: string;
  closedByUserId?: string | null;
  expiresAt?: string | null;
  openedAt?: string;
  status?: string;
  registeredAt?: string;
  closedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  cards?: MembershipCardDto[];
  customer?: {
    id?: string;
    name?: string;
    phone?: string;
    email?: string;
  };
  cardTemplate?: {
    id?: string;
    name?: string;
    tier?: string;
  };
}

export interface MembershipCardDto {
  id?: string;
  tenantId?: string;
  walletId?: string;
  cardUid?: string;
  label?: string;
  roomNumber?: string;
  status?: string;
  issuedAt?: string;
  issuedByUserId?: string;
  deactivatedAt?: string | null;
  replacedByCardId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface MembershipRegisterDto {
  tierId: string;
  guestName: string;
  guestPhone: string;
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
    amount: string;
    reference?: string;
  };
  idempotencyKey?: string;
}

export interface MembershipTopupDto {
  amount: string;
  paymentMethodId: string;
  posSessionId: string;
  locationId: string;
  reference?: string;
  guestCardId?: string;
  idempotencyKey?: string;
  notes?: string;
}

export interface MembershipRefundDto {
  amount: string;
  paymentMethodId: string;
  posSessionId: string;
  locationId: string;
  reference?: string;
  idempotencyKey?: string;
  notes?: string;
}

export interface MembershipBindCardDto {
  walletId: string;
  cardUid: string;
  label?: string;
  roomNumber?: string;
}

export interface MembershipSettleDto {
  posSessionId: string;
  locationId: string;
  refund?: {
    paymentMethodId: string;
    reference?: string;
  };
  collect?: {
    paymentMethodId: string;
    reference?: string;
    amount?: string;
  };
  idempotencyKey?: string;
  notes?: string;
}

export interface MembershipLedgerEntryDto {
  id?: string;
  tenantId?: string;
  walletId?: string;
  sequenceNo?: number;
  entryType?: string;
  amount?: number | string;
  purchasedDelta?: number | string;
  grantedDelta?: number | string;
  balanceAfter?: number | string;
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

export interface MembershipWalletAuditDto {
  walletId?: string;
  balanced?: boolean;
  storedBalance?: number | string;
  replayedBalance?: number | string;
  drift?: number | string;
  message?: string;
  [key: string]: unknown;
}

export interface MembershipSettlementQuoteDto {
  walletId: string;
  walletNumber: string;
  guestName: string;
  status: string;
  balance: number | string;
  purchasedBalance: number | string;
  grantedBalance: number | string;
  action: string;
  refundable: number | string;
  forfeitable: number | string;
  collectable: number | string;
  blockers?: Array<{
    type?: string;
    id?: string;
    label?: string;
  }>;
}
