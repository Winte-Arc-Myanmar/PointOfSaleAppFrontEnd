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

export interface CountAmountDto {
  count?: number;
  amount?: string;
}

export interface NamedPaymentTotalDto {
  paymentMethodId?: string;
  name?: string;
  kind?: string;
  count?: number;
  amount?: string;
}

export interface SalesSummaryDto {
  from?: string;
  to?: string;
  locationIds?: string[];
  orders?: {
    count?: number;
    averageNetSales?: string;
    averageGrandTotal?: string;
    voided?: CountAmountDto;
  };
  sales?: {
    grossSales?: string;
    lineDiscounts?: string;
    orderDiscounts?: string;
    totalDiscounts?: string;
    netSales?: string;
    serviceCharge?: string;
    tax?: string;
    tips?: string;
    grandTotal?: string;
  };
  refunds?: {
    count?: number;
    subtotal?: string;
    tax?: string;
    total?: string;
    byMethod?: Array<{
      refundMethod?: string;
      count?: number;
      amount?: string;
    }>;
  };
  netAfterRefunds?: string;
  voidedLines?: CountAmountDto;
  compedLines?: CountAmountDto;
  payments?: {
    byMethod?: NamedPaymentTotalDto[];
    tendered?: string;
    changeGiven?: string;
  };
  byDay?: Array<{
    businessDate?: string;
    orderCount?: number;
    netSales?: string;
    grandTotal?: string;
    refunds?: string;
  }>;
  byHour?: Array<{
    hour?: number;
    orderCount?: number;
    netSales?: string;
    grandTotal?: string;
  }>;
  byOutlet?: Array<{
    locationId?: string;
    locationName?: string;
    orderCount?: number;
    netSales?: string;
    grandTotal?: string;
  }>;
  byServiceType?: Array<{
    serviceType?: string;
    orderCount?: number;
    netSales?: string;
    grandTotal?: string;
  }>;
}

export interface ItemSalesDto {
  from?: string;
  to?: string;
  locationIds?: string[];
  totals?: {
    itemCount?: number;
    quantitySold?: string;
    grossSales?: string;
    lineDiscounts?: string;
    orderDiscounts?: string;
    netSales?: string;
    quantityReturned?: string;
    refundAmount?: string;
    netAfterRefunds?: string;
    quantityVoided?: string;
    voidedValue?: string;
    quantityComped?: string;
    compedValue?: string;
  };
  categories?: Array<{
    categoryId?: string;
    categoryName?: string;
    orderCount?: number;
    quantitySold?: string;
    netSales?: string;
    shareOfNetSales?: string;
    refundAmount?: string;
  }>;
  items?: Array<{
    variantId?: string;
    productId?: string;
    productName?: string;
    variantSku?: string;
    categoryId?: string;
    categoryName?: string;
    orderCount?: number;
    quantitySold?: string;
    averagePrice?: string;
    grossSales?: string;
    lineDiscounts?: string;
    orderDiscounts?: string;
    netSales?: string;
    shareOfNetSales?: string;
    quantityReturned?: string;
    refundAmount?: string;
    netQuantity?: string;
    netAfterRefunds?: string;
    quantityVoided?: string;
    voidedValue?: string;
    quantityComped?: string;
    compedValue?: string;
  }>;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}

export interface OtherIncomeDto {
  from?: string;
  to?: string;
  locationIds?: string[];
  totals?: {
    incomeCount?: number;
    income?: string;
    expenseCount?: number;
    expense?: string;
    net?: string;
  };
  byDay?: Array<{
    businessDate?: string;
    income?: string;
    expense?: string;
    net?: string;
  }>;
  byPaymentMethod?: Array<{
    paymentMethodId?: string;
    name?: string;
    kind?: string;
    income?: string;
    expense?: string;
  }>;
  byOutlet?: Array<{
    locationId?: string;
    locationName?: string;
    income?: string;
    expense?: string;
    net?: string;
  }>;
  entries?: Array<{
    id?: string;
    businessDate?: string;
    createdAt?: string;
    type?: string;
    reason?: string;
    amount?: string;
    locationId?: string;
    locationName?: string;
    paymentMethodId?: string;
    paymentMethodName?: string;
    reference?: string;
    notes?: string;
    posSessionId?: string;
    staffName?: string;
    approverName?: string;
  }>;
}

export interface MemberCardDto {
  from?: string;
  to?: string;
  locationIds?: string[];
  issued?: {
    count?: number;
    linkedToCustomer?: number;
    byTier?: Array<{
      tier?: string;
      count?: number;
      preloadValue?: string;
    }>;
  };
  closed?: {
    count?: number;
    settled?: number;
    voided?: number;
  };
  topUps?: {
    count?: number;
    amount?: string;
    byPaymentMethod?: NamedPaymentTotalDto[];
  };
  ledger?: {
    topUps?: CountAmountDto;
    preloadGranted?: CountAmountDto;
    spend?: CountAmountDto & { reversals?: number };
    refunds?: CountAmountDto;
    settlementsCollected?: CountAmountDto;
    forfeited?: CountAmountDto;
    adjustmentsCredit?: CountAmountDto;
    adjustmentsDebit?: CountAmountDto;
    netChange?: string;
  };
  spendByOutlet?: Array<{
    locationId?: string;
    locationName?: string;
    count?: number;
    amount?: string;
  }>;
  spendByTier?: Array<{
    tier?: string;
    amount?: string;
  }>;
  outstanding?: {
    activeCards?: number;
    walletsInCredit?: number;
    owedToGuests?: string;
    purchased?: string;
    granted?: string;
    walletsInDebt?: number;
    owedByGuests?: string;
  };
}

export interface LoyaltyPointsDto {
  from?: string;
  to?: string;
  locationIds?: string[];
  period?: {
    pointsEarned?: number;
    pointsReversed?: number;
    netPoints?: number;
    activeMembers?: number;
    newMembers?: number;
    byTransactionType?: Array<{
      transactionType?: string;
      entries?: number;
      points?: number;
    }>;
  };
  outstanding?: {
    members?: number;
    points?: number;
    pointsRedeemed?: number;
    pointsExpired?: number;
  };
  byLoyaltyTier?: Array<{
    loyaltyTier?: string;
    members?: number;
  }>;
  topMembers?: Array<{
    customerId?: string;
    name?: string;
    phone?: string;
    loyaltyTier?: string;
    pointsEarned?: number;
    pointsBalance?: number;
  }>;
}
