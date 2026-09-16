"use client";

import { useState } from "react";
import Link from "next/link";
import { Bluetooth, Plug, PlugZap, Printer, Unplug, Wifi } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { DetailSection } from "@/presentation/components/detail";
import { useBluetoothPrinter } from "@/presentation/hooks/useBluetoothPrinter";
import { usePrinterPreferences } from "@/presentation/hooks/usePrinterPreferences";
import { useUsbPrinter } from "@/presentation/hooks/useUsbPrinter";
import { useWifiPrinter } from "@/presentation/hooks/useWifiPrinter";
import { useToast } from "@/presentation/providers/ToastProvider";
import type { ThermalPaperWidth } from "@/core/domain/entities/ThermalPrint";
import type {
  ReceiptPrinterTransport,
  WifiPrinterProtocol,
} from "@/lib/printer-preferences";
import { forgetUsbPrinter } from "@/lib/usb-printer";
import { forgetBluetoothPrinter } from "@/lib/bluetooth-printer";
import { defaultPort } from "@/lib/wifi-printer";

export function ReceiptPrinterConnection({ compact = false }: { compact?: boolean }) {
  const toast = useToast();
  const { preferences, setReceiptPreferences } = usePrinterPreferences();
  const usb = useUsbPrinter();
  const bluetooth = useBluetoothPrinter();
  const wifi = useWifiPrinter();
  const receipt = preferences.receipt;
  const transport = receipt.transport ?? (receipt.mode === "browser" ? "browser" : "usb");
  const [wifiHost, setWifiHost] = useState(receipt.wifiHost ?? "");
  const [wifiPort, setWifiPort] = useState(String(receipt.wifiPort ?? 80));
  const [wifiProtocol, setWifiProtocol] = useState<WifiPrinterProtocol>(
    receipt.wifiProtocol ?? "epos",
  );

  const setTransport = (next: ReceiptPrinterTransport) => {
    setReceiptPreferences({
      transport: next,
      mode: next === "browser" ? "browser" : "raw-escpos",
    });
  };

  const handleUsbConnect = async () => {
    try {
      const device = await usb.connect();
      toast.success(`Connected to ${device.label}.`);
    } catch {
      toast.error(usb.error ?? "Could not connect USB printer.");
    }
  };

  const handleBluetoothConnect = async () => {
    try {
      const device = await bluetooth.connect();
      toast.success(`Paired ${device.label}.`);
    } catch {
      toast.error(bluetooth.error ?? "Could not connect Bluetooth printer.");
    }
  };

  const handleWifiSave = () => {
    try {
      const saved = wifi.save({
        host: wifiHost,
        port: Number(wifiPort) || defaultPort(wifiProtocol),
        protocol: wifiProtocol,
      });
      toast.success(`Saved Wi‑Fi printer ${saved.host}:${saved.port}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save Wi‑Fi printer.");
    }
  };

  return (
    <DetailSection title="Receipt printer" icon={Printer}>
      <p className="mb-4 text-sm text-muted">
        Connect this terminal’s receipt printer over USB, Bluetooth (BLE), or Wi‑Fi
        (Epson ePOS / Star WebPRNT). Kitchen printers on the LAN still use the server
        (IP:port) path below.
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label>Connection</Label>
          <Select
            value={transport}
            onValueChange={(value) => setTransport(value as ReceiptPrinterTransport)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="browser">Browser print dialog</SelectItem>
              <SelectItem value="usb">USB (WebUSB)</SelectItem>
              <SelectItem value="bluetooth">Bluetooth (BLE)</SelectItem>
              <SelectItem value="wifi">Wi‑Fi / LAN (HTTP)</SelectItem>
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

      {transport === "usb" ? (
        <div className="mt-4 rounded-xl border border-border bg-background/80 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-foreground">USB connection</p>
              <p className="text-sm text-muted">
                {usb.connected
                  ? `Connected: ${usb.connected.label}`
                  : receipt.usbDeviceLabel
                    ? `Saved: ${receipt.usbDeviceLabel} (not active)`
                    : "No USB printer connected"}
              </p>
              {!usb.supported ? (
                <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
                  WebUSB needs Chrome or Edge.
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={() => void handleUsbConnect()}
                disabled={!usb.supported || usb.isBusy}
              >
                <Plug className="size-4" />
                {usb.isBusy ? "Connecting..." : "Connect USB"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => void usb.disconnect()}
                disabled={!usb.connected || usb.isBusy}
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
                onClick={() => void usb.testPrint()}
                disabled={usb.isBusy}
              >
                <PlugZap className="size-4" />
                Test USB print
              </Button>
              {receipt.usbDeviceLabel ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => void forgetUsbPrinter().then(() => usb.refresh())}
                  disabled={usb.isBusy}
                >
                  Forget saved printer
                </Button>
              ) : null}
            </div>
          ) : null}
          {usb.error ? <p className="mt-3 text-sm text-red-500">{usb.error}</p> : null}
        </div>
      ) : null}

      {transport === "bluetooth" ? (
        <div className="mt-4 rounded-xl border border-border bg-background/80 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-foreground">Bluetooth connection</p>
              <p className="text-sm text-muted">
                {bluetooth.connected
                  ? `Connected: ${bluetooth.connected.label}`
                  : receipt.bluetoothDeviceLabel
                    ? `Last paired: ${receipt.bluetoothDeviceLabel} (tap Connect to pair again)`
                    : "No Bluetooth printer paired"}
              </p>
              {!bluetooth.supported ? (
                <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
                  Web Bluetooth needs Chrome or Edge, HTTPS or localhost, and a BLE
                  printer. Classic Bluetooth (SPP) is not available in the browser.
                </p>
              ) : (
                <p className="mt-1 text-xs text-muted">
                  Put the printer in pairing mode, then choose it in the browser picker.
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={() => void handleBluetoothConnect()}
                disabled={!bluetooth.supported || bluetooth.isBusy}
              >
                <Bluetooth className="size-4" />
                {bluetooth.isBusy ? "Pairing..." : "Connect Bluetooth"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => void bluetooth.disconnect()}
                disabled={!bluetooth.connected || bluetooth.isBusy}
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
                onClick={() => void bluetooth.testPrint()}
                disabled={bluetooth.isBusy || !bluetooth.connected}
              >
                <PlugZap className="size-4" />
                Test Bluetooth print
              </Button>
              {receipt.bluetoothDeviceLabel ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() =>
                    void forgetBluetoothPrinter().then(() => bluetooth.refresh())
                  }
                  disabled={bluetooth.isBusy}
                >
                  Forget saved printer
                </Button>
              ) : null}
            </div>
          ) : null}
          {bluetooth.error ? (
            <p className="mt-3 text-sm text-red-500">{bluetooth.error}</p>
          ) : null}
        </div>
      ) : null}

      {transport === "wifi" ? (
        <div className="mt-4 space-y-3 rounded-xl border border-border bg-background/80 p-4">
          <p className="text-sm font-medium text-foreground">Wi‑Fi / LAN connection</p>
          <p className="text-sm text-muted">
            Browsers cannot open raw TCP 9100. Use a printer with an HTTP print API
            (Epson ePOS or Star WebPRNT). Cheap Wi‑Fi printers that only speak 9100
            must be printed through USB, Bluetooth, or the kitchen printer server path.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="wifi-host">Printer IP / hostname</Label>
              <Input
                id="wifi-host"
                value={wifiHost}
                onChange={(event) => setWifiHost(event.target.value)}
                placeholder="192.168.1.80"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="wifi-port">Port</Label>
              <Input
                id="wifi-port"
                type="number"
                min={1}
                max={65535}
                value={wifiPort}
                onChange={(event) => setWifiPort(event.target.value)}
              />
            </div>
            <div className="grid gap-2 sm:col-span-3">
              <Label>Protocol</Label>
              <Select
                value={wifiProtocol}
                onValueChange={(value) => {
                  const protocol = value as WifiPrinterProtocol;
                  setWifiProtocol(protocol);
                  if (!wifiPort || wifiPort === "9100") {
                    setWifiPort(String(defaultPort(protocol)));
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="epos">Epson ePOS (HTTP)</SelectItem>
                  <SelectItem value="star">Star WebPRNT (HTTP)</SelectItem>
                  <SelectItem value="http-raw">HTTP raw ESC/POS</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={handleWifiSave}>
              <Wifi className="size-4" />
              Save Wi‑Fi printer
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => void wifi.testPrint()}
              disabled={wifi.isBusy}
            >
              <PlugZap className="size-4" />
              {wifi.isBusy ? "Sending..." : "Test Wi‑Fi print"}
            </Button>
            {wifi.target ? (
              <Button type="button" variant="ghost" onClick={wifi.forget}>
                Forget saved printer
              </Button>
            ) : null}
          </div>
          {wifi.error ? <p className="text-sm text-red-500">{wifi.error}</p> : null}
        </div>
      ) : null}

      {transport === "browser" ? (
        <p className="mt-4 text-sm text-muted">
          Checkout will open the system print dialog. Pair a USB or Bluetooth printer
          in Windows/macOS first if you want the OS to own the connection.
        </p>
      ) : null}

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
