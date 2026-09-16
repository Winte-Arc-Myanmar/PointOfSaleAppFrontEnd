"use client";

import { useCallback, useState } from "react";
import {
  buildBluetoothTestPrint,
  connectBluetoothPrinter,
  disconnectBluetoothPrinter,
  getConnectedBluetoothPrinter,
  isWebBluetoothSupported,
  printEscPosToBluetooth,
  type BluetoothPrinterDeviceInfo,
} from "@/lib/bluetooth-printer";

export function useBluetoothPrinter() {
  const [supported] = useState(isWebBluetoothSupported);
  const [connected, setConnected] = useState<BluetoothPrinterDeviceInfo | null>(
    () => getConnectedBluetoothPrinter(),
  );
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setConnected(getConnectedBluetoothPrinter());
  }, []);

  const connect = useCallback(async () => {
    setIsBusy(true);
    setError(null);
    try {
      const device = await connectBluetoothPrinter();
      setConnected(device);
      return device;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to connect Bluetooth printer.";
      setError(message);
      throw err;
    } finally {
      setIsBusy(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    setIsBusy(true);
    setError(null);
    try {
      await disconnectBluetoothPrinter();
      setConnected(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to disconnect Bluetooth printer.";
      setError(message);
      throw err;
    } finally {
      setIsBusy(false);
    }
  }, []);

  const testPrint = useCallback(async () => {
    setIsBusy(true);
    setError(null);
    try {
      await printEscPosToBluetooth(buildBluetoothTestPrint());
      setConnected(getConnectedBluetoothPrinter());
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Bluetooth test print failed.";
      setError(message);
      throw err;
    } finally {
      setIsBusy(false);
    }
  }, []);

  return {
    supported,
    connected,
    isBusy,
    error,
    connect,
    disconnect,
    testPrint,
    refresh,
  };
}
