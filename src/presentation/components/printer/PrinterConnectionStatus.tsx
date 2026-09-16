"use client";

import Link from "next/link";
import { AlertCircle, CheckCircle2, Printer } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { useKitchenPrinters } from "@/presentation/hooks/useKitchenPrinters";
import { usePrinterPreferences } from "@/presentation/hooks/usePrinterPreferences";
import { useUsbPrinter } from "@/presentation/hooks/useUsbPrinter";

export function PrinterConnectionStatus() {
  const { preferences } = usePrinterPreferences();
  const usb = useUsbPrinter();
  const { data: kitchenResult } = useKitchenPrinters({ page: 1, limit: 200 });
  const kitchenPrinter = kitchenResult?.items.find(
    (printer) => String(printer.id) === String(preferences.kitchen.printerId),
  );

  const receiptReady =
    preferences.receipt.mode === "browser" || Boolean(usb.connected || preferences.receipt.usbDeviceLabel);
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
              {preferences.receipt.mode === "browser"
                ? "Browser print dialog"
                : usb.connected
                  ? usb.connected.label
                  : preferences.receipt.usbDeviceLabel
                    ? `${preferences.receipt.usbDeviceLabel} (reconnect needed)`
                    : "Not connected"}
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
