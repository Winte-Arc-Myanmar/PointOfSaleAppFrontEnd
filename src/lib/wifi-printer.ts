import { EscPosEncoder } from "@/core/application/print/EscPosEncoder";
import {
  loadPrinterPreferences,
  updateReceiptPrinterPreferences,
  type WifiPrinterProtocol,
} from "@/lib/printer-preferences";

export interface WifiPrinterTarget {
  host: string;
  port: number;
  protocol: WifiPrinterProtocol;
}

export function getSavedWifiPrinter(): WifiPrinterTarget | null {
  const prefs = loadPrinterPreferences().receipt;
  if (!prefs.wifiHost) return null;
  return {
    host: prefs.wifiHost,
    port: prefs.wifiPort ?? defaultPort(prefs.wifiProtocol ?? "epos"),
    protocol: prefs.wifiProtocol ?? "epos",
  };
}

export function saveWifiPrinter(target: WifiPrinterTarget): WifiPrinterTarget {
  const host = target.host.trim();
  if (!host) {
    throw new Error("Enter the printer IP address or hostname.");
  }
  const port = Number(target.port);
  if (!Number.isFinite(port) || port < 1 || port > 65535) {
    throw new Error("Enter a valid printer port.");
  }

  updateReceiptPrinterPreferences({
    mode: "raw-escpos",
    transport: "wifi",
    wifiHost: host,
    wifiPort: port,
    wifiProtocol: target.protocol,
  });

  return { host, port, protocol: target.protocol };
}

export function forgetWifiPrinter(): void {
  updateReceiptPrinterPreferences({
    wifiHost: undefined,
    wifiPort: undefined,
    wifiProtocol: undefined,
  });
}

export async function printEscPosToWifi(bytes: Uint8Array, target?: WifiPrinterTarget): Promise<void> {
  const printer = target ?? getSavedWifiPrinter();
  if (!printer) {
    throw new Error("No Wi‑Fi printer saved. Enter the printer IP in Printer setup.");
  }
  if (printer.port === 9100) {
    throw new Error(
      "Raw port 9100 cannot be opened from a browser. Use Epson ePOS (port 80), Star WebPRNT, USB, or Bluetooth, or send kitchen tickets through the server.",
    );
  }

  const url = buildPrintUrl(printer);
  const body = buildPrintBody(printer, bytes);
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": contentType(printer.protocol),
    },
    body,
    mode: "cors",
  });

  if (!response.ok) {
    throw new Error(
      `Wi‑Fi printer returned ${response.status}. Confirm the printer is on the LAN and the protocol matches (Epson ePOS or Star WebPRNT).`,
    );
  }
}

export function buildWifiTestPrint(): Uint8Array {
  return new EscPosEncoder()
    .initialize()
    .align("center")
    .bold(true)
    .line("POS TEST PRINT")
    .bold(false)
    .newline()
    .align("left")
    .line("Wi-Fi receipt printer connected.")
    .line(new Date().toLocaleString())
    .newline(2)
    .cut()
    .encode();
}

export function defaultPort(protocol: WifiPrinterProtocol): number {
  if (protocol === "http-raw") return 80;
  if (protocol === "star") return 80;
  return 80;
}

function buildPrintUrl(printer: WifiPrinterTarget): string {
  const origin = `http://${printer.host}:${printer.port}`;
  if (printer.protocol === "epos") {
    return `${origin}/cgi-bin/epos/service.cgi?devid=local_printer&timeout=10000`;
  }
  if (printer.protocol === "star") {
    return `${origin}/StarWebPRNT/SendMessage`;
  }
  return `${origin}/`;
}

function contentType(protocol: WifiPrinterProtocol): string {
  if (protocol === "http-raw") return "application/octet-stream";
  return "text/xml; charset=utf-8";
}

function buildPrintBody(printer: WifiPrinterTarget, bytes: Uint8Array): BodyInit {
  if (printer.protocol === "http-raw") {
    const copy = new Uint8Array(bytes.byteLength);
    copy.set(bytes);
    return copy;
  }
  if (printer.protocol === "star") {
    return starWebPrntXml(bytes);
  }
  return epsonEposXml(bytes);
}

function epsonEposXml(bytes: Uint8Array): string {
  const hex = toHex(bytes);
  return [
    '<?xml version="1.0" encoding="utf-8"?>',
    '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">',
    "<s:Body>",
    '<epos-print xmlns="http://www.epson-pos.com/schemas/2011/03/epos-print">',
    `<command>${hex}</command>`,
    "</epos-print>",
    "</s:Body>",
    "</s:Envelope>",
  ].join("");
}

function starWebPrntXml(bytes: Uint8Array): string {
  const hex = toHex(bytes);
  return [
    '<?xml version="1.0" encoding="utf-8"?>',
    "<StarWebPrint>",
    `<Request><PrintJob>${hex}</PrintJob></Request>`,
    "</StarWebPrint>",
  ].join("");
}

function toHex(bytes: Uint8Array): string {
  let hex = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    hex += bytes[i].toString(16).padStart(2, "0").toUpperCase();
  }
  return hex;
}
