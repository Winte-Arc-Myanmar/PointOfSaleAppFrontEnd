"use client";

import { useCallback, useEffect, useState } from "react";
import {
  loadPrinterPreferences,
  savePrinterPreferences,
  type PrinterPreferences,
  type ReceiptPrinterPreferences,
  updateKitchenPrinterPreferences,
  updateReceiptPrinterPreferences,
} from "@/lib/printer-preferences";

export function usePrinterPreferences() {
  const [preferences, setPreferences] = useState<PrinterPreferences>(() =>
    loadPrinterPreferences(),
  );

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === "pos-printer-preferences") {
        setPreferences(loadPrinterPreferences());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const refresh = useCallback(() => {
    setPreferences(loadPrinterPreferences());
  }, []);

  const setReceiptPreferences = useCallback(
    (patch: Partial<ReceiptPrinterPreferences>) => {
      setPreferences(updateReceiptPrinterPreferences(patch));
    },
    [],
  );

  const setKitchenPrinterId = useCallback((printerId: string | undefined) => {
    setPreferences(updateKitchenPrinterPreferences({ printerId }));
  }, []);

  const replaceAll = useCallback((next: PrinterPreferences) => {
    savePrinterPreferences(next);
    setPreferences(next);
  }, []);

  return {
    preferences,
    refresh,
    setReceiptPreferences,
    setKitchenPrinterId,
    replaceAll,
  };
}
