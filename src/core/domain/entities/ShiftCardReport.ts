import type { NameAmount } from "./PosReport";

export interface ShiftTakings {
  salesCount: number;
  refundCount: number;
  totalSales: string;
  totalRefunds: string;
  netTotal: string;
  /** Guest-card deposits taken; not sales. */
  cardTopUps: string;
  cardRefunds: string;
  payments: NameAmount[];
}

export interface ShiftRow extends ShiftTakings {
  sessionId: string;
  businessDate: string;
  registerName: string;
  locationName: string;
  cashierId: string;
  cashierName: string;
  openedAt: string;
  closedAt: string | null;
  status: string;
}

export interface ShiftStaffRow extends ShiftTakings {
  cashierId: string;
  cashierName: string;
  shifts: number;
}

export interface ShiftReport {
  from: string;
  to: string;
  totals: ShiftTakings & { shifts: number };
  byStaff: ShiftStaffRow[];
  byPaymentMethod: { name: string; kind: string; count: number; amount: string }[];
  shifts: ShiftRow[];
}

export type CardEntryType =
  | "TOP_UP"
  | "PRELOAD_GRANT"
  | "SPEND"
  | "SPEND_REVERSAL"
  | "REFUND_OUT"
  | "SETTLEMENT_COLLECTION"
  | "GRANT_FORFEIT"
  | "ADJUSTMENT_CREDIT"
  | "ADJUSTMENT_DEBIT";

export interface CardEntry {
  entryId: string;
  businessDate: string;
  createdAt: string;
  type: CardEntryType;
  cardUid: string | null;
  walletNumber: string;
  guestName: string;
  guestPhone: string | null;
  tier: string;
  locationName: string;
  orderNumber: string | null;
  paymentMethod: string | null;
  /** Signed: onto the card positive, off it negative. */
  amount: string;
  balanceAfter: string;
  reference: string | null;
  staffName: string | null;
  approverName: string | null;
  notes: string | null;
}

export interface CardActivityReport {
  from: string;
  to: string;
  kind: "USAGE" | "MONEY";
  totals: {
    entries: number;
    netChange: string;
    byType: { type: CardEntryType; count: number; amount: string }[];
  };
  byTier: { tier: string; count: number; amount: string }[];
  byPaymentMethod: {
    name: string;
    count: number;
    topUps: string;
    refunds: string;
    settlements: string;
    net: string;
  }[];
  entries: CardEntry[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}
