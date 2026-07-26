import type { Receipt } from "@/core/domain/entities/Receipt";
import type {
  DailySalesSummary,
  ZReport,
} from "@/core/domain/entities/Report";
import type {
  OrderSlip,
  ThermalPrintOptions,
  ThermalPrintResult,
} from "@/core/domain/entities/ThermalPrint";

export interface ReportPrintContext {
  locationName?: string;
}

export interface IThermalPrintService {
  printReceipt(
    receipt: Receipt,
    options?: ThermalPrintOptions,
  ): Promise<ThermalPrintResult>;

  printOrderSlip(
    slip: OrderSlip,
    options?: ThermalPrintOptions,
  ): Promise<ThermalPrintResult>;

  printZReport(
    report: ZReport,
    context?: ReportPrintContext,
    options?: ThermalPrintOptions,
  ): Promise<ThermalPrintResult>;

  printDailySales(
    summary: DailySalesSummary,
    context?: ReportPrintContext,
    options?: ThermalPrintOptions,
  ): Promise<ThermalPrintResult>;

  /** Build raw ESC/POS bytes without sending them. */
  buildReceiptEscPos(
    receipt: Receipt,
    options?: ThermalPrintOptions,
  ): Uint8Array;

  buildOrderSlipEscPos(
    slip: OrderSlip,
    options?: ThermalPrintOptions,
  ): Uint8Array;
}
