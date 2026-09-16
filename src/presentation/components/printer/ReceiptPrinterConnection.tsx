"use client";

import Link from "next/link";
import { Plug, PlugZap, Printer, Unplug } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { Label } from "@/presentation/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { DetailSection } from "@/presentation/components/detail";
import { usePrinterPreferences } from "@/presentation/hooks/usePrinterPreferences";
import { useUsbPrinter } from "@/presentation/hooks/useUsbPrinter";
import { useToast } from "@/presentation/providers/ToastProvider";
import type { ThermalPaperWidth, ThermalPrintMode } from "@/core/domain/entities/ThermalPrint";
import { forgetUsbPrinter } from "@/lib/usb-printer";

export function ReceiptPrinterConnection({ compact = false }: { compact?: boolean }) {
  const toast = useToast();
  const { preferences, setReceiptPreferences } = usePrinterPreferences();
  const usb = useUsbPrinter();
  const receipt = preferences.receipt;
  const isConnected = Boolean(usb.connected);

  const handleConnect = async () => {
    try {
      const device = await usb.connect();
      toast.success(`Connected to ${device.label}.`);
    } catch {
      toast.error(usb.error ?? "Could not connect USB printer.");
    }
  };

  const handleDisconnect = async () => {
    try {
      await usb.disconnect();
      toast.success("USB printer disconnected.");
    } catch {
      toast.error(usb.error ?? "Could not disconnect USB printer.");
    }
  };

  const handleForget = async () => {
    try {
      await forgetUsbPrinter();
      await usb.refresh();
      toast.success("Saved USB printer removed from this terminal.");
    } catch {
      toast.error("Could not forget USB printer.");
    }
  };

  const handleTestPrint = async () => {
    try {
      await usb.testPrint();
      toast.success("Test print sent to USB printer.");
    } catch {
      toast.error(usb.error ?? "Test print failed.");
    }
  };

  return (
    <DetailSection title="Receipt printer" icon={Printer}>
      <p className="mb-4 text-sm text-muted">
        Connect the cashier receipt printer over USB (WebUSB) or use the browser print
        dialog with a Windows/macOS thermal driver.
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label>Print mode</Label>
          <Select
            value={receipt.mode}
            onValueChange={(value) =>
              setReceiptPreferences({ mode: value as ThermalPrintMode })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="browser">Browser print dialog</SelectItem>
              <SelectItem value="raw-escpos">USB ESC/POS (direct)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label>Paper width</Label>
          <Select
            value={String(receipt.paperWidthMm)}
            onValueChange={(value) =>
              setReceiptPreferences({
                paperWidthMm: Number(value) as ThermalPaperWidth,
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="80">80mm thermal</SelectItem>
              <SelectItem value="58">58mm thermal</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-border bg-background/80 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-foreground">USB connection</p>
            <p className="text-sm text-muted">
              {isConnected
                ? `Connected: ${usb.connected?.label}`
                : receipt.usbDeviceLabel
                  ? `Saved: ${receipt.usbDeviceLabel} (not active)`
                  : "No USB printer connected"}
            </p>
            {!usb.supported ? (
              <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
                WebUSB needs Chrome or Edge. USB readers can still use browser print mode.
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={() => void handleConnect()}
              disabled={!usb.supported || usb.isBusy}
            >
              <Plug className="size-4" />
              {usb.isBusy ? "Connecting..." : "Connect USB"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => void handleDisconnect()}
              disabled={!isConnected || usb.isBusy}
            >
              <Unplug className="size-4" />
              Disconnect
            </Button>
          </div>
        </div>

        {!compact ? (
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => void handleTestPrint()}
              disabled={usb.isBusy || receipt.mode !== "raw-escpos"}
            >
              <PlugZap className="size-4" />
              Test USB print
            </Button>
            {receipt.usbDeviceLabel ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => void handleForget()}
                disabled={usb.isBusy}
              >
                Forget saved printer
              </Button>
            ) : null}
          </div>
        ) : null}

        {usb.error ? <p className="mt-3 text-sm text-red-500">{usb.error}</p> : null}
      </div>

      {!compact ? (
        <p className="mt-3 text-xs text-muted">
          Checkout, receipts, and reports use these settings automatically. Open{" "}
          <Link href="/printer-setup" className="text-mint underline-offset-2 hover:underline">
            Printer setup
          </Link>{" "}
          from any POS screen if you need to reconnect.
        </p>
      ) : null}
    </DetailSection>
  );
}
