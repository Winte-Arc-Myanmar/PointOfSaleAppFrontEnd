"use client";

import { useCallback, useState } from "react";
import {
  buildWifiTestPrint,
  forgetWifiPrinter,
  getSavedWifiPrinter,
  printEscPosToWifi,
  saveWifiPrinter,
  type WifiPrinterTarget,
} from "@/lib/wifi-printer";
import { loadPrinterPreferences } from "@/lib/printer-preferences";

export function useWifiPrinter() {
  const [target, setTarget] = useState<WifiPrinterTarget | null>(() =>
    getSavedWifiPrinter(),
  );
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setTarget(getSavedWifiPrinter());
  }, []);

  const save = useCallback((next: WifiPrinterTarget) => {
    setError(null);
    const saved = saveWifiPrinter(next);
    setTarget(saved);
    return saved;
  }, []);

  const forget = useCallback(() => {
    forgetWifiPrinter();
    setTarget(null);
  }, []);

  const testPrint = useCallback(async () => {
    setIsBusy(true);
    setError(null);
    try {
      const current = getSavedWifiPrinter() ?? target;
      if (!current) {
        throw new Error("Save the Wi‑Fi printer address first.");
      }
      await printEscPosToWifi(buildWifiTestPrint(), current);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Wi‑Fi test print failed.";
      setError(message);
      throw err;
    } finally {
      setIsBusy(false);
    }
  }, [target]);

  return {
    target,
    saved: Boolean(loadPrinterPreferences().receipt.wifiHost),
    isBusy,
    error,
    save,
    forget,
    testPrint,
    refresh,
  };
}
