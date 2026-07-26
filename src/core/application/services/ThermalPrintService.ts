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
import type {
  IThermalPrintGateway,
  IThermalReceiptFormatter,
} from "@/core/domain/repositories/IThermalPrintGateway";
import type {
  IThermalPrintService,
  ReportPrintContext,
} from "@/core/domain/services/IThermalPrintService";

const DEFAULT_OPTIONS: Required<ThermalPrintOptions> = {
  paperWidthMm: 80,
  mode: "browser",
  cut: true,
};

function resolveOptions(
  options?: ThermalPrintOptions,
): Required<ThermalPrintOptions> {
  return {
    paperWidthMm: options?.paperWidthMm ?? DEFAULT_OPTIONS.paperWidthMm,
    mode: options?.mode ?? DEFAULT_OPTIONS.mode,
    cut: options?.cut ?? DEFAULT_OPTIONS.cut,
  };
}

export class ThermalPrintService implements IThermalPrintService {
  constructor(
    private readonly formatter: IThermalReceiptFormatter,
    private readonly gateway: IThermalPrintGateway,
  ) {}

  async printReceipt(
    receipt: Receipt,
    options?: ThermalPrintOptions,
  ): Promise<ThermalPrintResult> {
    const resolved = resolveOptions(options);
    const formatted = this.formatter.formatReceipt(receipt, resolved);

    if (resolved.mode === "raw-escpos") {
      return this.gateway.printEscPos(formatted.bytes, resolved);
    }
    return this.gateway.printHtml(formatted.html, resolved);
  }

  async printOrderSlip(
    slip: OrderSlip,
    options?: ThermalPrintOptions,
  ): Promise<ThermalPrintResult> {
    const resolved = resolveOptions(options);
    const formatted = this.formatter.formatOrderSlip(slip, resolved);

    if (resolved.mode === "raw-escpos") {
      return this.gateway.printEscPos(formatted.bytes, resolved);
    }
    return this.gateway.printHtml(formatted.html, resolved);
  }

  async printZReport(
    report: ZReport,
    context?: ReportPrintContext,
    options?: ThermalPrintOptions,
  ): Promise<ThermalPrintResult> {
    const resolved = resolveOptions(options);
    const formatted = this.formatter.formatZReport(report, context, resolved);

    if (resolved.mode === "raw-escpos") {
      return this.gateway.printEscPos(formatted.bytes, resolved);
    }
    return this.gateway.printHtml(formatted.html, resolved);
  }

  async printDailySales(
    summary: DailySalesSummary,
    context?: ReportPrintContext,
    options?: ThermalPrintOptions,
  ): Promise<ThermalPrintResult> {
    const resolved = resolveOptions(options);
    const formatted = this.formatter.formatDailySales(summary, context, resolved);

    if (resolved.mode === "raw-escpos") {
      return this.gateway.printEscPos(formatted.bytes, resolved);
    }
    return this.gateway.printHtml(formatted.html, resolved);
  }

  buildReceiptEscPos(
    receipt: Receipt,
    options?: ThermalPrintOptions,
  ): Uint8Array {
    return this.formatter.formatReceipt(receipt, resolveOptions(options)).bytes;
  }

  buildOrderSlipEscPos(
    slip: OrderSlip,
    options?: ThermalPrintOptions,
  ): Uint8Array {
    return this.formatter.formatOrderSlip(slip, resolveOptions(options)).bytes;
  }
}
