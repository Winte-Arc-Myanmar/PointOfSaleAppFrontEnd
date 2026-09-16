"use client";

import Link from "next/link";
import { AlertCircle, CheckCircle2, Printer } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { useBluetoothPrinter } from "@/presentation/hooks/useBluetoothPrinter";
import { useKitchenPrinters } from "@/presentation/hooks/useKitchenPrinters";
import { usePrinterPreferences } from "@/presentation/hooks/usePrinterPreferences";
import { useUsbPrinter } from "@/presentation/hooks/useUsbPrinter";

export function PrinterConnectionStatus() {
  const { preferences } = usePrinterPreferences();
  const usb = useUsbPrinter();
  const bluetooth = useBluetoothPrinter();
  const { data: kitchenResult } = useKitchenPrinters({ page: 1, limit: 200 });
  const kitchenPrinter = kitchenResult?.items.find(
    (printer) => String(printer.id) === String(preferences.kitchen.printerId),
  );
  const transport = preferences.receipt.transport ?? "browser";
  const receiptReady =
    transport === "browser" ||
    (transport === "usb" && Boolean(usb.connected || preferences.receipt.usbDeviceLabel)) ||
    (transport === "bluetooth" &&
      Boolean(bluetooth.connected || preferences.receipt.bluetoothDeviceLabel)) ||
    (transport === "wifi" && Boolean(preferences.receipt.wifiHost));
  const kitchenReady = Boolean(kitchenPrinter);

  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Printer className="h-4 w-4 text-mint" />
          <p className="text-sm font-medium text-foreground">Printers</p>
        </div>
        <Link href="/printer-setup">
          <Button type="button" variant="ghost" size="sm">Setup</Button>
        </Link>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex items-start gap-2">
          {receiptReady ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-mint" />
          ) : (
            <AlertCircle className="mt-0.5 h-4 w-4 text-amber-600" />
          )}
          <div>
            <p className="font-medium">Receipt</p>
            <p className="text-muted">
              {transport === "browser"
                ? "Browser print dialog"
                : transport === "bluetooth"
                  ? bluetooth.connected
                    ? `Bluetooth · ${bluetooth.connected.label}`
                    : preferences.receipt.bluetoothDeviceLabel
                      ? `Bluetooth · ${preferences.receipt.bluetoothDeviceLabel} (reconnect)`
                      : "Bluetooth not paired"
                  : transport === "wifi"
                    ? preferences.receipt.wifiHost
                      ? `Wi‑Fi · ${preferences.receipt.wifiHost}:${preferences.receipt.wifiPort ?? 80}`
                      : "Wi‑Fi printer not saved"
                    : usb.connected
                      ? `USB · ${usb.connected.label}`
                      : preferences.receipt.usbDeviceLabel
                        ? `USB · ${preferences.receipt.usbDeviceLabel} (reconnect needed)`
                        : "USB not connected"}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          {kitchenReady ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-mint" />
          ) : (
            <AlertCircle className="mt-0.5 h-4 w-4 text-amber-600" />
          )}
          <div>
            <p className="font-medium">Kitchen</p>
            <p className="text-muted">
              {kitchenPrinter
                ? `${kitchenPrinter.name} · ${kitchenPrinter.ipAddress}:${kitchenPrinter.port}`
                : "No kitchen printer assigned"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
