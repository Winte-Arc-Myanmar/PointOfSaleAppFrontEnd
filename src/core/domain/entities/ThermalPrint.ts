/**
 * Thermal printer domain types.
 * Supports common 58mm and 80mm ESC/POS receipt printers.
 */

export type ThermalPaperWidth = 58 | 80;

export type ThermalPrintMode = "browser" | "raw-escpos";

export interface ThermalPrintOptions {
  /** Paper width in millimeters. Default: 80 */
  paperWidthMm?: ThermalPaperWidth;
  /** How to deliver the job. Default: browser (thermal CSS + window.print) */
  mode?: ThermalPrintMode;
  /** Open cut command after the receipt. Default: true */
  cut?: boolean;
}

export interface ThermalPrintResult {
  success: boolean;
  mode: ThermalPrintMode;
  /** Present when mode is raw-escpos and bytes were generated */
  rawBytes?: Uint8Array;
  message?: string;
}

/** Minimal cart snapshot for pre-payment order-slip thermal print. */
export interface OrderSlipLine {
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  note?: string;
}

export interface OrderSlip {
  title?: string;
  businessName?: string;
  orderNumber?: string;
  orderType?: string;
  tableNumber?: string;
  dateTime?: string;
  lines: OrderSlipLine[];
  subtotal: number;
  tax?: number;
  total: number;
  footerMessage?: string;
}
