"use client";

import { useCallback, useEffect, useState } from "react";
import {
  buildUsbTestPrint,
  connectUsbPrinter,
  disconnectUsbPrinter,
  getConnectedUsbPrinter,
  isWebUsbSupported,
  listAuthorizedUsbPrinters,
  printEscPosToUsb,
  reconnectSavedUsbPrinter,
  type UsbPrinterDeviceInfo,
} from "@/lib/usb-printer";

export function useUsbPrinter() {
  const [supported] = useState(isWebUsbSupported);
  const [connected, setConnected] = useState<UsbPrinterDeviceInfo | null>(null);
  const [authorized, setAuthorized] = useState<UsbPrinterDeviceInfo[]>([]);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!supported) return;
    const devices = await listAuthorizedUsbPrinters();
    setAuthorized(devices);
    setConnected(getConnectedUsbPrinter());
  }, [supported]);

  useEffect(() => {
    void refresh();
    void reconnectSavedUsbPrinter()
      .then((device) => {
        if (device) setConnected(device);
      })
      .catch(() => {
        // Saved device not available on this session.
      });
  }, [refresh]);

  const connect = useCallback(async () => {
    setIsBusy(true);
    setError(null);
    try {
      const device = await connectUsbPrinter();
      setConnected(device);
      await refresh();
      return device;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to connect USB printer.";
      setError(message);
      throw err;
    } finally {
      setIsBusy(false);
    }
  }, [refresh]);

  const disconnect = useCallback(async () => {
    setIsBusy(true);
    setError(null);
    try {
      await disconnectUsbPrinter();
      setConnected(null);
      await refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to disconnect USB printer.";
      setError(message);
      throw err;
    } finally {
      setIsBusy(false);
    }
  }, [refresh]);

  const testPrint = useCallback(async () => {
    setIsBusy(true);
    setError(null);
    try {
      await printEscPosToUsb(buildUsbTestPrint());
      setConnected(getConnectedUsbPrinter());
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Test print failed.";
      setError(message);
      throw err;
    } finally {
      setIsBusy(false);
    }
  }, []);

  return {
    supported,
    connected,
    authorized,
    isBusy,
    error,
    connect,
    disconnect,
    testPrint,
    refresh,
  };
}
