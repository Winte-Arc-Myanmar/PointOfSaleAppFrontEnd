import type {
  CountAmountDto,
  DailySalesSummaryDto,
  ItemSalesDto,
  LoyaltyPointsDto,
  MemberCardDto,
  NamedPaymentTotalDto,
  OtherIncomeDto,
  PaymentBreakdownDto,
  SalesByCategoryDto,
  SalesByHourDto,
  SalesByItemDto,
  SalesSummaryDto,
  ServerPerformanceDto,
  ZReportDto,
  ZReportPaymentDto,
} from "@/core/application/dtos/ReportDto";
import type {
  CountAmount,
  DailySalesSummary,
  ItemSalesReport,
  LoyaltyPointsReport,
  MemberCardReport,
  NamedPaymentTotal,
  OtherIncomeReport,
  PaymentBreakdown,
  ReportPageMeta,
  SalesByCategory,
  SalesByHour,
  SalesByItem,
  SalesSummaryReport,
  ServerPerformance,
  ZReport,
  ZReportPayment,
} from "@/core/domain/entities/Report";

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function money(value: unknown): string {
  if (value == null || value === "") return "0.0000";
  return String(value);
}

function text(value: unknown): string {
  return value == null ? "" : String(value);
}

function asArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

function toCountAmount(dto: CountAmountDto | undefined): CountAmount {
  return {
    count: toNumber(dto?.count),
    amount: money(dto?.amount),
  };
}

function toNamedPayment(dto: NamedPaymentTotalDto): NamedPaymentTotal {
  return {
    paymentMethodId: text(dto.paymentMethodId),
    name: text(dto.name),
    kind: text(dto.kind),
    count: toNumber(dto.count),
    amount: money(dto.amount),
  };
}

function toPageMeta(dto: ItemSalesDto["meta"]): ReportPageMeta {
  return {
    total: toNumber(dto?.total),
    page: toNumber(dto?.page, 1),
    limit: toNumber(dto?.limit, 50),
    totalPages: toNumber(dto?.totalPages),
  };
}

function toPaymentBreakdown(dto: PaymentBreakdownDto): PaymentBreakdown {
  return {
    paymentMethodId: dto.paymentMethodId ?? "",
    method: dto.method ?? "",
    total: dto.total ?? "0.0000",
  };
}

function toZReportPayment(dto: ZReportPaymentDto): ZReportPayment {
  return {
    ...toPaymentBreakdown(dto),
    tip: dto.tip ?? "0.0000",
  };
}

function toSalesByCategory(dto: SalesByCategoryDto): SalesByCategory {
  return {
    categoryId: dto.categoryId ?? "",
    categoryName: dto.categoryName ?? "",
    orderCount: toNumber(dto.orderCount, 0),
    totalRevenue: dto.totalRevenue ?? "0.0000",
  };
}

function toSalesByItem(dto: SalesByItemDto): SalesByItem {
  return {
    variantId: dto.variantId ?? "",
    productName: dto.productName ?? "",
    variantSku: dto.variantSku ?? "",
    quantitySold: dto.quantitySold ?? "0.0000",
    totalRevenue: dto.totalRevenue ?? "0.0000",
  };
}

export function toDailySalesSummary(dto: DailySalesSummaryDto): DailySalesSummary {
  return {
    locationId: dto.locationId ?? "",
    date: dto.date ?? "",
    orderCount: toNumber(dto.orderCount, 0),
    subtotal: dto.subtotal ?? "0.0000",
    totalTax: dto.totalTax ?? "0.0000",
    totalDiscount: dto.totalDiscount ?? "0.0000",
    tipAmount: dto.tipAmount ?? "0.0000",
    serviceCharge: dto.serviceCharge ?? "0.0000",
    grandTotal: dto.grandTotal ?? "0.0000",
    averageTicket: dto.averageTicket ?? "0.0000",
    paymentBreakdown: (dto.paymentBreakdown ?? []).map(toPaymentBreakdown),
  };
}

export function toSalesByCategoryList(dtos: SalesByCategoryDto[]): SalesByCategory[] {
  return (dtos ?? []).map(toSalesByCategory);
}

export function toSalesByItemList(dtos: SalesByItemDto[]): SalesByItem[] {
  return (dtos ?? []).map(toSalesByItem);
}

export function toSalesByHour(dto: SalesByHourDto): SalesByHour {
  return {
    hour: toNumber(dto.hour, 0),
    orderCount: toNumber(dto.orderCount, 0),
    totalRevenue: dto.totalRevenue ?? "0.0000",
  };
}

export function toSalesByHourList(dtos: SalesByHourDto[]): SalesByHour[] {
  return (dtos ?? []).map(toSalesByHour);
}

export function toServerPerformance(dto: ServerPerformanceDto): ServerPerformance {
  return {
    waiterId: dto.waiterId ?? "",
    waiterName: dto.waiterName ?? "",
    orderCount: toNumber(dto.orderCount, 0),
    totalRevenue: dto.totalRevenue ?? "0.0000",
    totalTips: dto.totalTips ?? "0.0000",
    averageTicket: dto.averageTicket ?? "0.0000",
  };
}

export function toServerPerformanceList(dtos: ServerPerformanceDto[]): ServerPerformance[] {
  return (dtos ?? []).map(toServerPerformance);
}

export function toZReport(dto: ZReportDto): ZReport {
  return {
    locationId: dto.locationId ?? "",
    date: dto.date ?? "",
    orders: {
      completed: toNumber(dto.orders?.completed, 0),
      voided: toNumber(dto.orders?.voided, 0),
      refunded: toNumber(dto.orders?.refunded, 0),
    },
    totals: {
      subtotal: dto.totals?.subtotal ?? "0.0000",
      totalDiscount: dto.totals?.totalDiscount ?? "0.0000",
      totalTax: dto.totals?.totalTax ?? "0.0000",
      tipAmount: dto.totals?.tipAmount ?? "0.0000",
      serviceCharge: dto.totals?.serviceCharge ?? "0.0000",
      grandTotal: dto.totals?.grandTotal ?? "0.0000",
    },
    payments: (dto.payments ?? []).map(toZReportPayment),
    topItems: toSalesByItemList(dto.topItems ?? []),
    byCategory: toSalesByCategoryList(dto.byCategory ?? []),
  };
}

export function toSalesSummary(dto: SalesSummaryDto): SalesSummaryReport {
  return {
    from: text(dto.from),
    to: text(dto.to),
    locationIds: asArray(dto.locationIds).map((id) => text(id)),
    orders: {
      count: toNumber(dto.orders?.count),
      averageNetSales: money(dto.orders?.averageNetSales),
      averageGrandTotal: money(dto.orders?.averageGrandTotal),
      voided: toCountAmount(dto.orders?.voided),
    },
    sales: {
      grossSales: money(dto.sales?.grossSales),
      lineDiscounts: money(dto.sales?.lineDiscounts),
      orderDiscounts: money(dto.sales?.orderDiscounts),
      totalDiscounts: money(dto.sales?.totalDiscounts),
      netSales: money(dto.sales?.netSales),
      serviceCharge: money(dto.sales?.serviceCharge),
      tax: money(dto.sales?.tax),
      tips: money(dto.sales?.tips),
      grandTotal: money(dto.sales?.grandTotal),
    },
    refunds: {
      count: toNumber(dto.refunds?.count),
      subtotal: money(dto.refunds?.subtotal),
      tax: money(dto.refunds?.tax),
      total: money(dto.refunds?.total),
      byMethod: asArray(dto.refunds?.byMethod).map((row) => ({
        refundMethod: text(row.refundMethod),
        count: toNumber(row.count),
        amount: money(row.amount),
      })),
    },
    netAfterRefunds: money(dto.netAfterRefunds),
    voidedLines: toCountAmount(dto.voidedLines),
    compedLines: toCountAmount(dto.compedLines),
    payments: {
      byMethod: asArray(dto.payments?.byMethod).map(toNamedPayment),
      tendered: money(dto.payments?.tendered),
      changeGiven: money(dto.payments?.changeGiven),
    },
    byDay: asArray(dto.byDay).map((row) => ({
      businessDate: text(row.businessDate),
      orderCount: toNumber(row.orderCount),
      netSales: money(row.netSales),
      grandTotal: money(row.grandTotal),
      refunds: money(row.refunds),
    })),
    byHour: asArray(dto.byHour).map((row) => ({
      hour: toNumber(row.hour),
      orderCount: toNumber(row.orderCount),
      netSales: money(row.netSales),
      grandTotal: money(row.grandTotal),
    })),
    byOutlet: asArray(dto.byOutlet).map((row) => ({
      locationId: text(row.locationId),
      locationName: text(row.locationName),
      orderCount: toNumber(row.orderCount),
      netSales: money(row.netSales),
      grandTotal: money(row.grandTotal),
    })),
    byServiceType: asArray(dto.byServiceType).map((row) => ({
      serviceType: text(row.serviceType),
      orderCount: toNumber(row.orderCount),
      netSales: money(row.netSales),
      grandTotal: money(row.grandTotal),
    })),
  };
}

export function toItemSales(dto: ItemSalesDto): ItemSalesReport {
  return {
    from: text(dto.from),
    to: text(dto.to),
    locationIds: asArray(dto.locationIds).map((id) => text(id)),
    totals: {
      itemCount: toNumber(dto.totals?.itemCount),
      quantitySold: money(dto.totals?.quantitySold),
      grossSales: money(dto.totals?.grossSales),
      lineDiscounts: money(dto.totals?.lineDiscounts),
      orderDiscounts: money(dto.totals?.orderDiscounts),
      netSales: money(dto.totals?.netSales),
      quantityReturned: money(dto.totals?.quantityReturned),
      refundAmount: money(dto.totals?.refundAmount),
      netAfterRefunds: money(dto.totals?.netAfterRefunds),
      quantityVoided: money(dto.totals?.quantityVoided),
      voidedValue: money(dto.totals?.voidedValue),
      quantityComped: money(dto.totals?.quantityComped),
      compedValue: money(dto.totals?.compedValue),
    },
    categories: asArray(dto.categories).map((row) => ({
      categoryId: text(row.categoryId),
      categoryName: text(row.categoryName),
      orderCount: toNumber(row.orderCount),
      quantitySold: money(row.quantitySold),
      netSales: money(row.netSales),
      shareOfNetSales: money(row.shareOfNetSales),
      refundAmount: money(row.refundAmount),
    })),
    items: asArray(dto.items).map((row) => ({
      variantId: text(row.variantId),
      productId: text(row.productId),
      productName: text(row.productName),
      variantSku: text(row.variantSku),
      categoryId: text(row.categoryId),
      categoryName: text(row.categoryName),
      orderCount: toNumber(row.orderCount),
      quantitySold: money(row.quantitySold),
      averagePrice: money(row.averagePrice),
      grossSales: money(row.grossSales),
      lineDiscounts: money(row.lineDiscounts),
      orderDiscounts: money(row.orderDiscounts),
      netSales: money(row.netSales),
      shareOfNetSales: money(row.shareOfNetSales),
      quantityReturned: money(row.quantityReturned),
      refundAmount: money(row.refundAmount),
      netQuantity: money(row.netQuantity),
      netAfterRefunds: money(row.netAfterRefunds),
      quantityVoided: money(row.quantityVoided),
      voidedValue: money(row.voidedValue),
      quantityComped: money(row.quantityComped),
      compedValue: money(row.compedValue),
    })),
    meta: toPageMeta(dto.meta),
  };
}

export function toOtherIncome(dto: OtherIncomeDto): OtherIncomeReport {
  return {
    from: text(dto.from),
    to: text(dto.to),
    locationIds: asArray(dto.locationIds).map((id) => text(id)),
    totals: {
      incomeCount: toNumber(dto.totals?.incomeCount),
      income: money(dto.totals?.income),
      expenseCount: toNumber(dto.totals?.expenseCount),
      expense: money(dto.totals?.expense),
      net: money(dto.totals?.net),
    },
    byDay: asArray(dto.byDay).map((row) => ({
      businessDate: text(row.businessDate),
      income: money(row.income),
      expense: money(row.expense),
      net: money(row.net),
    })),
    byPaymentMethod: asArray(dto.byPaymentMethod).map((row) => ({
      paymentMethodId: text(row.paymentMethodId),
      name: text(row.name),
      kind: text(row.kind),
      income: money(row.income),
      expense: money(row.expense),
    })),
    byOutlet: asArray(dto.byOutlet).map((row) => ({
      locationId: text(row.locationId),
      locationName: text(row.locationName),
      income: money(row.income),
      expense: money(row.expense),
      net: money(row.net),
    })),
    entries: asArray(dto.entries).map((row) => ({
      id: text(row.id),
      businessDate: text(row.businessDate),
      createdAt: text(row.createdAt),
      type: text(row.type),
      reason: text(row.reason),
      amount: money(row.amount),
      locationId: text(row.locationId),
      locationName: text(row.locationName),
      paymentMethodId: text(row.paymentMethodId),
      paymentMethodName: text(row.paymentMethodName),
      reference: text(row.reference),
      notes: text(row.notes),
      posSessionId: text(row.posSessionId),
      staffName: text(row.staffName),
      approverName: text(row.approverName),
    })),
  };
}

export function toMemberCards(dto: MemberCardDto): MemberCardReport {
  return {
    from: text(dto.from),
    to: text(dto.to),
    locationIds: asArray(dto.locationIds).map((id) => text(id)),
    issued: {
      count: toNumber(dto.issued?.count),
      linkedToCustomer: toNumber(dto.issued?.linkedToCustomer),
      byTier: asArray(dto.issued?.byTier).map((row) => ({
        tier: text(row.tier),
        count: toNumber(row.count),
        preloadValue: money(row.preloadValue),
      })),
    },
    closed: {
      count: toNumber(dto.closed?.count),
      settled: toNumber(dto.closed?.settled),
      voided: toNumber(dto.closed?.voided),
    },
    topUps: {
      count: toNumber(dto.topUps?.count),
      amount: money(dto.topUps?.amount),
      byPaymentMethod: asArray(dto.topUps?.byPaymentMethod).map(toNamedPayment),
    },
    ledger: {
      topUps: toCountAmount(dto.ledger?.topUps),
      preloadGranted: toCountAmount(dto.ledger?.preloadGranted),
      spend: {
        ...toCountAmount(dto.ledger?.spend),
        reversals: toNumber(dto.ledger?.spend?.reversals),
      },
      refunds: toCountAmount(dto.ledger?.refunds),
      settlementsCollected: toCountAmount(dto.ledger?.settlementsCollected),
      forfeited: toCountAmount(dto.ledger?.forfeited),
      adjustmentsCredit: toCountAmount(dto.ledger?.adjustmentsCredit),
      adjustmentsDebit: toCountAmount(dto.ledger?.adjustmentsDebit),
      netChange: money(dto.ledger?.netChange),
    },
    spendByOutlet: asArray(dto.spendByOutlet).map((row) => ({
      locationId: text(row.locationId),
      locationName: text(row.locationName),
      count: toNumber(row.count),
      amount: money(row.amount),
    })),
    spendByTier: asArray(dto.spendByTier).map((row) => ({
      tier: text(row.tier),
      amount: money(row.amount),
    })),
    outstanding: {
      activeCards: toNumber(dto.outstanding?.activeCards),
      walletsInCredit: toNumber(dto.outstanding?.walletsInCredit),
      owedToGuests: money(dto.outstanding?.owedToGuests),
      purchased: money(dto.outstanding?.purchased),
      granted: money(dto.outstanding?.granted),
      walletsInDebt: toNumber(dto.outstanding?.walletsInDebt),
      owedByGuests: money(dto.outstanding?.owedByGuests),
    },
  };
}

export function toLoyaltyPoints(dto: LoyaltyPointsDto): LoyaltyPointsReport {
  return {
    from: text(dto.from),
    to: text(dto.to),
    locationIds: asArray(dto.locationIds).map((id) => text(id)),
    period: {
      pointsEarned: toNumber(dto.period?.pointsEarned),
      pointsReversed: toNumber(dto.period?.pointsReversed),
      netPoints: toNumber(dto.period?.netPoints),
      activeMembers: toNumber(dto.period?.activeMembers),
      newMembers: toNumber(dto.period?.newMembers),
      byTransactionType: asArray(dto.period?.byTransactionType).map((row) => ({
        transactionType: text(row.transactionType),
        entries: toNumber(row.entries),
        points: toNumber(row.points),
      })),
    },
    outstanding: {
      members: toNumber(dto.outstanding?.members),
      points: toNumber(dto.outstanding?.points),
      pointsRedeemed: toNumber(dto.outstanding?.pointsRedeemed),
      pointsExpired: toNumber(dto.outstanding?.pointsExpired),
    },
    byLoyaltyTier: asArray(dto.byLoyaltyTier).map((row) => ({
      loyaltyTier: text(row.loyaltyTier),
      members: toNumber(row.members),
    })),
    topMembers: asArray(dto.topMembers).map((row) => ({
      customerId: text(row.customerId),
      name: text(row.name),
      phone: text(row.phone),
      loyaltyTier: text(row.loyaltyTier),
      pointsEarned: toNumber(row.pointsEarned),
      pointsBalance: toNumber(row.pointsBalance),
    })),
  };
}
