import type {
  OrderSlip,
  ThermalPrintOptions,
  ThermalPrintResult,
} from "@/core/domain/entities/ThermalPrint";
import type { Receipt } from "@/core/domain/entities/Receipt";

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
}
