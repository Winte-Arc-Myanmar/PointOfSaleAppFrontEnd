import type { ThermalPaperWidth, ThermalPrintMode } from "@/core/domain/entities/ThermalPrint";

const STORAGE_KEY = "pos-printer-preferences";

export interface ReceiptPrinterPreferences {
  mode: ThermalPrintMode;
  paperWidthMm: ThermalPaperWidth;
  usbDeviceLabel?: string;
  usbVendorId?: number;
  usbProductId?: number;
  usbSerialNumber?: string;
}

export interface KitchenPrinterPreferences {
  printerId?: string;
}

export interface PrinterPreferences {
  receipt: ReceiptPrinterPreferences;
  kitchen: KitchenPrinterPreferences;
}

const DEFAULT_PREFERENCES: PrinterPreferences = {
  receipt: {
    mode: "browser",
    paperWidthMm: 80,
  },
  kitchen: {},
};

export function loadPrinterPreferences(): PrinterPreferences {
  if (typeof window === "undefined") return DEFAULT_PREFERENCES;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(raw) as Partial<PrinterPreferences>;
    return {
      receipt: {
        ...DEFAULT_PREFERENCES.receipt,
        ...parsed.receipt,
      },
      kitchen: {
        ...DEFAULT_PREFERENCES.kitchen,
        ...parsed.kitchen,
      },
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function savePrinterPreferences(preferences: PrinterPreferences): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
}

export function updateReceiptPrinterPreferences(
  patch: Partial<ReceiptPrinterPreferences>,
): PrinterPreferences {
  const current = loadPrinterPreferences();
  const next = {
    ...current,
    receipt: { ...current.receipt, ...patch },
  };
  savePrinterPreferences(next);
  return next;
}

export function updateKitchenPrinterPreferences(
  patch: Partial<KitchenPrinterPreferences>,
): PrinterPreferences {
  const current = loadPrinterPreferences();
  const next = {
    ...current,
    kitchen: { ...current.kitchen, ...patch },
  };
  savePrinterPreferences(next);
  return next;
}
