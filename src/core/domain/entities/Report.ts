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
