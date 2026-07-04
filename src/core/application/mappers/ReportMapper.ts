import type {
  DailySalesSummaryDto,
  PaymentBreakdownDto,
  SalesByCategoryDto,
  SalesByHourDto,
  SalesByItemDto,
  ServerPerformanceDto,
  ZReportDto,
  ZReportPaymentDto,
} from "@/core/application/dtos/ReportDto";
import type {
  DailySalesSummary,
  PaymentBreakdown,
  SalesByCategory,
  SalesByHour,
  SalesByItem,
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
