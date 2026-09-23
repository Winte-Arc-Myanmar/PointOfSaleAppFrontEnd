export interface PaymentBreakdown {
  paymentMethodId: string;
  method: string;
  total: string;
}

export interface DailySalesSummary {
  locationId: string;
  date: string;
  orderCount: number;
  subtotal: string;
  totalTax: string;
  totalDiscount: string;
  tipAmount: string;
  serviceCharge: string;
  grandTotal: string;
  averageTicket: string;
  paymentBreakdown: PaymentBreakdown[];
}

export interface SalesByCategory {
  categoryId: string;
  categoryName: string;
  orderCount: number;
  totalRevenue: string;
}

export interface SalesByItem {
  variantId: string;
  productName: string;
  variantSku: string;
  quantitySold: string;
  totalRevenue: string;
}

export interface SalesByHour {
  hour: number;
  orderCount: number;
  totalRevenue: string;
}

export interface ServerPerformance {
  waiterId: string;
  waiterName: string;
  orderCount: number;
  totalRevenue: string;
  totalTips: string;
  averageTicket: string;
}

export interface ZReportPayment extends PaymentBreakdown {
  tip: string;
}

export interface ZReportOrders {
  completed: number;
  voided: number;
  refunded: number;
}

export interface ZReportTotals {
  subtotal: string;
  totalDiscount: string;
  totalTax: string;
  tipAmount: string;
  serviceCharge: string;
  grandTotal: string;
}

export interface ZReport {
  locationId: string;
  date: string;
  orders: ZReportOrders;
  totals: ZReportTotals;
  payments: ZReportPayment[];
  topItems: SalesByItem[];
  byCategory: SalesByCategory[];
}

export interface CountAmount {
  count: number;
  amount: string;
}

export interface NamedPaymentTotal {
  paymentMethodId: string;
  name: string;
  kind: string;
  count: number;
  amount: string;
}

export interface SalesSummaryOrders {
  count: number;
  averageNetSales: string;
  averageGrandTotal: string;
  voided: CountAmount;
}

export interface SalesSummarySales {
  grossSales: string;
  lineDiscounts: string;
  orderDiscounts: string;
  totalDiscounts: string;
  netSales: string;
  serviceCharge: string;
  tax: string;
  tips: string;
  grandTotal: string;
}

export interface SalesSummaryRefundMethod {
  refundMethod: string;
  count: number;
  amount: string;
}

export interface SalesSummaryRefunds {
  count: number;
  subtotal: string;
  tax: string;
  total: string;
  byMethod: SalesSummaryRefundMethod[];
}

export interface SalesSummaryPayments {
  byMethod: NamedPaymentTotal[];
  tendered: string;
  changeGiven: string;
}

export interface SalesSummaryByDay {
  businessDate: string;
  orderCount: number;
  netSales: string;
  grandTotal: string;
  refunds: string;
}

export interface SalesSummaryByHour {
  hour: number;
  orderCount: number;
  netSales: string;
  grandTotal: string;
}

export interface SalesSummaryByOutlet {
  locationId: string;
  locationName: string;
  orderCount: number;
  netSales: string;
  grandTotal: string;
}

export interface SalesSummaryByServiceType {
  serviceType: string;
  orderCount: number;
  netSales: string;
  grandTotal: string;
}

export interface SalesSummaryReport {
  from: string;
  to: string;
  locationIds: string[];
  orders: SalesSummaryOrders;
  sales: SalesSummarySales;
  refunds: SalesSummaryRefunds;
  netAfterRefunds: string;
  voidedLines: CountAmount;
  compedLines: CountAmount;
  payments: SalesSummaryPayments;
  byDay: SalesSummaryByDay[];
  byHour: SalesSummaryByHour[];
  byOutlet: SalesSummaryByOutlet[];
  byServiceType: SalesSummaryByServiceType[];
}

export interface ItemSalesTotals {
  itemCount: number;
  quantitySold: string;
  grossSales: string;
  lineDiscounts: string;
  orderDiscounts: string;
  netSales: string;
  quantityReturned: string;
  refundAmount: string;
  netAfterRefunds: string;
  quantityVoided: string;
  voidedValue: string;
  quantityComped: string;
  compedValue: string;
}

export interface ItemSalesCategory {
  categoryId: string;
  categoryName: string;
  orderCount: number;
  quantitySold: string;
  netSales: string;
  shareOfNetSales: string;
  refundAmount: string;
}

export interface ItemSalesRow {
  variantId: string;
  productId: string;
  productName: string;
  variantSku: string;
  categoryId: string;
  categoryName: string;
  orderCount: number;
  quantitySold: string;
  averagePrice: string;
  grossSales: string;
  lineDiscounts: string;
  orderDiscounts: string;
  netSales: string;
  shareOfNetSales: string;
  quantityReturned: string;
  refundAmount: string;
  netQuantity: string;
  netAfterRefunds: string;
  quantityVoided: string;
  voidedValue: string;
  quantityComped: string;
  compedValue: string;
}

export interface ReportPageMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ItemSalesReport {
  from: string;
  to: string;
  locationIds: string[];
  totals: ItemSalesTotals;
  categories: ItemSalesCategory[];
  items: ItemSalesRow[];
  meta: ReportPageMeta;
}

export interface OtherIncomeTotals {
  incomeCount: number;
  income: string;
  expenseCount: number;
  expense: string;
  net: string;
}

export interface OtherIncomeByDay {
  businessDate: string;
  income: string;
  expense: string;
  net: string;
}

export interface OtherIncomeByPaymentMethod {
  paymentMethodId: string;
  name: string;
  kind: string;
  income: string;
  expense: string;
}

export interface OtherIncomeByOutlet {
  locationId: string;
  locationName: string;
  income: string;
  expense: string;
  net: string;
}

export interface OtherIncomeEntry {
  id: string;
  businessDate: string;
  createdAt: string;
  type: string;
  reason: string;
  amount: string;
  locationId: string;
  locationName: string;
  paymentMethodId: string;
  paymentMethodName: string;
  reference: string;
  notes: string;
  posSessionId: string;
  staffName: string;
  approverName: string;
}

export interface OtherIncomeReport {
  from: string;
  to: string;
  locationIds: string[];
  totals: OtherIncomeTotals;
  byDay: OtherIncomeByDay[];
  byPaymentMethod: OtherIncomeByPaymentMethod[];
  byOutlet: OtherIncomeByOutlet[];
  entries: OtherIncomeEntry[];
}

export interface MemberCardTierIssue {
  tier: string;
  count: number;
  preloadValue: string;
}

export interface MemberCardLedgerBucket extends CountAmount {
  reversals?: number;
}

export interface MemberCardReport {
  from: string;
  to: string;
  locationIds: string[];
  issued: {
    count: number;
    linkedToCustomer: number;
    byTier: MemberCardTierIssue[];
  };
  closed: {
    count: number;
    settled: number;
    voided: number;
  };
  topUps: {
    count: number;
    amount: string;
    byPaymentMethod: NamedPaymentTotal[];
  };
  ledger: {
    topUps: CountAmount;
    preloadGranted: CountAmount;
    spend: MemberCardLedgerBucket;
    refunds: CountAmount;
    settlementsCollected: CountAmount;
    forfeited: CountAmount;
    adjustmentsCredit: CountAmount;
    adjustmentsDebit: CountAmount;
    netChange: string;
  };
  spendByOutlet: Array<{
    locationId: string;
    locationName: string;
    count: number;
    amount: string;
  }>;
  spendByTier: Array<{
    tier: string;
    amount: string;
  }>;
  outstanding: {
    activeCards: number;
    walletsInCredit: number;
    owedToGuests: string;
    purchased: string;
    granted: string;
    walletsInDebt: number;
    owedByGuests: string;
  };
}

export interface LoyaltyTransactionTypeTotal {
  transactionType: string;
  entries: number;
  points: number;
}

export interface LoyaltyTierCount {
  loyaltyTier: string;
  members: number;
}

export interface LoyaltyTopMember {
  customerId: string;
  name: string;
  phone: string;
  loyaltyTier: string;
  pointsEarned: number;
  pointsBalance: number;
}

export interface LoyaltyPointsReport {
  from: string;
  to: string;
  locationIds: string[];
  period: {
    pointsEarned: number;
    pointsReversed: number;
    netPoints: number;
    activeMembers: number;
    newMembers: number;
    byTransactionType: LoyaltyTransactionTypeTotal[];
  };
  outstanding: {
    members: number;
    points: number;
    pointsRedeemed: number;
    pointsExpired: number;
  };
  byLoyaltyTier: LoyaltyTierCount[];
  topMembers: LoyaltyTopMember[];
}
