/**
 * DTOs for POS session API request/response.
 * Cash fields are decimals (strings) on the wire; repositories normalize writes and mappers parse reads.
 */

export interface PosSessionDto {
  id?: string;
  tenantId: string;
  registerId: string;
  cashierId: string;
  openedAt?: string | null;
  closedAt?: string | null;
  openingCashFloat: number;
  expectedClosingCash: number;
  actualClosingCash?: number | null;
  cashVariance?: number | null;
  status: string;
  updatedAt?: string | null;
}

export interface ClosePosSessionRequestDto {
  actualClosingCash: number;
}

export interface PosSessionPaymentBreakdownItemDto {
  methodName: string;
  transactionCount: number;
  totalAmount: number;
}

export interface PosSessionSummaryDto {
  sessionId: string;
  registerName: string;
  cashierName: string;
  openedAt: string;
  closedAt: string;
  openingCashFloat: number;
  expectedClosingCash: number;
  actualClosingCash: number;
  cashVariance: number;
  totalSales: number;
  totalRefunds: number;
  netTotal: number;
  salesCount: number;
  refundCount: number;
  paymentBreakdown: PosSessionPaymentBreakdownItemDto[];
  status: string;
}

