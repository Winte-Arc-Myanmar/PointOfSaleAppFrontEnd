import type {
  OrderSlip,
  ThermalPrintOptions,
  ThermalPrintResult,
} from "@/core/domain/entities/ThermalPrint";
import type { Receipt } from "@/core/domain/entities/Receipt";
import type {
  DailySalesSummary,
  ZReport,
} from "@/core/domain/entities/Report";
import type { ReportPrintContext } from "@/core/domain/services/IThermalPrintService";

/**
 * Port for delivering a thermal print job to a printer transport
 * (browser print dialog, WebUSB, local bridge, etc.).
 */
export interface IThermalPrintGateway {
  printEscPos(
    bytes: Uint8Array,
    options: Required<ThermalPrintOptions>,
  ): Promise<ThermalPrintResult>;

  printHtml(
    html: string,
    options: Required<ThermalPrintOptions>,
  ): Promise<ThermalPrintResult>;
}

export interface IThermalReceiptFormatter {
  formatReceipt(
    receipt: Receipt,
    options: Required<ThermalPrintOptions>,
  ): { bytes: Uint8Array; html: string };

  formatOrderSlip(
    slip: OrderSlip,
    options: Required<ThermalPrintOptions>,
  ): { bytes: Uint8Array; html: string };

  formatZReport(
    report: ZReport,
    context: ReportPrintContext | undefined,
    options: Required<ThermalPrintOptions>,
  ): { bytes: Uint8Array; html: string };

  formatDailySales(
    summary: DailySalesSummary,
    context: ReportPrintContext | undefined,
    options: Required<ThermalPrintOptions>,
  ): { bytes: Uint8Array; html: string };
}
