export interface PosSessionPaymentBreakdownItem {
  methodName: string;
  transactionCount: number;
  totalAmount: number;
}

export interface PosSessionSummary {
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
  paymentBreakdown: PosSessionPaymentBreakdownItem[];
  status: string;
}

