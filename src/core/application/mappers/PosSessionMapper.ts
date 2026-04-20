import type { PosSession } from "@/core/domain/entities/PosSession";
import type {
  PosSessionDto,
  PosSessionSummaryDto,
} from "../dtos/PosSessionDto";
import type { PosSessionSummary } from "@/core/domain/entities/PosSessionSummary";

function parseDecimal(val: unknown): number {
  if (typeof val === "number" && Number.isFinite(val)) return val;
  if (
    val != null &&
    typeof val === "object" &&
    "s" in val &&
    "e" in val &&
    "d" in val
  ) {
    const { s, e, d } = val as { s: number; e: number; d: number[] };
    if (!Array.isArray(d)) return 0;
    let n = 0;
    for (let i = 0; i < d.length; i++) {
      n += d[i] * Math.pow(10, e - i * 7);
    }
    return s * n;
  }
  if (typeof val === "string") {
    const n = Number(val.trim());
    return Number.isFinite(n) ? n : 0;
  }
  return Number(val) || 0;
}

export function toPosSession(
  dto: Omit<
    PosSessionDto,
    "openingCashFloat" | "expectedClosingCash" | "actualClosingCash" | "cashVariance"
  > & {
    id: string;
    openingCashFloat?: unknown;
    expectedClosingCash?: unknown;
    actualClosingCash?: unknown;
    cashVariance?: unknown;
  }
): PosSession {
  return {
    id: dto.id,
    tenantId: dto.tenantId ?? "",
    registerId: dto.registerId ?? "",
    cashierId: dto.cashierId ?? "",
    openedAt: dto.openedAt ?? null,
    closedAt: dto.closedAt ?? null,
    openingCashFloat: parseDecimal(dto.openingCashFloat),
    expectedClosingCash: parseDecimal(dto.expectedClosingCash),
    actualClosingCash:
      dto.actualClosingCash == null ? null : parseDecimal(dto.actualClosingCash),
    cashVariance: dto.cashVariance == null ? null : parseDecimal(dto.cashVariance),
    status: dto.status ?? "OPEN",
    updatedAt: dto.updatedAt ?? null,
  };
}

export function toPosSessionSummary(
  dto: Omit<
    PosSessionSummaryDto,
    | "openingCashFloat"
    | "expectedClosingCash"
    | "actualClosingCash"
    | "cashVariance"
    | "totalSales"
    | "totalRefunds"
    | "netTotal"
    | "paymentBreakdown"
  > & {
    openingCashFloat?: unknown;
    expectedClosingCash?: unknown;
    actualClosingCash?: unknown;
    cashVariance?: unknown;
    totalSales?: unknown;
    totalRefunds?: unknown;
    netTotal?: unknown;
    paymentBreakdown?: Array<{
      methodName?: string;
      transactionCount?: number;
      totalAmount?: unknown;
    }>;
  }
): PosSessionSummary {
  return {
    sessionId: dto.sessionId,
    registerName: dto.registerName ?? "",
    cashierName: dto.cashierName ?? "",
    openedAt: dto.openedAt,
    closedAt: dto.closedAt,
    openingCashFloat: parseDecimal(dto.openingCashFloat),
    expectedClosingCash: parseDecimal(dto.expectedClosingCash),
    actualClosingCash: parseDecimal(dto.actualClosingCash),
    cashVariance: parseDecimal(dto.cashVariance),
    totalSales: parseDecimal(dto.totalSales),
    totalRefunds: parseDecimal(dto.totalRefunds),
    netTotal: parseDecimal(dto.netTotal),
    salesCount: Number(dto.salesCount) || 0,
    refundCount: Number(dto.refundCount) || 0,
    paymentBreakdown: Array.isArray(dto.paymentBreakdown)
      ? dto.paymentBreakdown.map((p) => ({
          methodName: p.methodName ?? "",
          transactionCount: Number(p.transactionCount) || 0,
          totalAmount: parseDecimal(p.totalAmount),
        }))
      : [],
    status: dto.status ?? "",
  };
}

