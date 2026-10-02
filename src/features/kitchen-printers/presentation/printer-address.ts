import { z } from "zod";
import type { KitchenPrinter } from "@/core/domain/entities/KitchenPrinter";

const IPV4 = /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/;
const DEFAULT_PORT = 9100;

export const ipAddressField = z
  .string()
  .trim()
  .refine((v) => v === "" || IPV4.test(v), "Enter a valid IPv4 address, or leave empty for USB / Bluetooth");

export const portField = z
  .string()
  .trim()
  .refine((v) => v === "" || (/^\d+$/.test(v) && Number(v) >= 1 && Number(v) <= 65535), "Port must be 1-65535");

export function toAddressPayload(ipAddress: string, port: string) {
  const ip = ipAddress.trim();
  if (!ip) return { ipAddress: null, port: null };
  return { ipAddress: ip, port: port.trim() ? Number(port) : DEFAULT_PORT };
}

export function formatPrinterAddress(printer: Pick<KitchenPrinter, "ipAddress" | "port">) {
  if (!printer.ipAddress) return "USB / Bluetooth";
  return `${printer.ipAddress}:${printer.port ?? DEFAULT_PORT}`;
}
