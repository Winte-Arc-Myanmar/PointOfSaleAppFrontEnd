export interface PaymentBreakdownDto {
  paymentMethodId: string;
  method: string;
  total: string;
}

export interface DailySalesSummaryDto {
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
  paymentBreakdown: PaymentBreakdownDto[];
}

export interface SalesByCategoryDto {
  categoryId: string;
  categoryName: string;
  orderCount: number;
  totalRevenue: string;
}

export interface SalesByItemDto {
  variantId: string;
  productName: string;
  variantSku: string;
  quantitySold: string;
  totalRevenue: string;
}

export interface SalesByHourDto {
  hour: number;
  orderCount: number;
  totalRevenue: string;
}

export interface ServerPerformanceDto {
  waiterId: string;
  waiterName: string;
  orderCount: number;
  totalRevenue: string;
  totalTips: string;
  averageTicket: string;
}

export interface ZReportPaymentDto extends PaymentBreakdownDto {
  tip: string;
}

export interface ZReportDto {
  locationId: string;
  date: string;
  orders: {
    completed: number;
    voided: number;
    refunded: number;
  };
  totals: {
    subtotal: string;
    totalDiscount: string;
    totalTax: string;
    tipAmount: string;
    serviceCharge: string;
    grandTotal: string;
  };
  payments: ZReportPaymentDto[];
  topItems: SalesByItemDto[];
  byCategory: SalesByCategoryDto[];
}
