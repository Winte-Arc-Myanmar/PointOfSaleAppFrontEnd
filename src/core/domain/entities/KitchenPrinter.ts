import type { Id } from "@/core/domain/types";

export const PRINTER_SECTORS = ["KDS", "CHECKOUT", "FINANCE"] as const;
export type PrinterSector = (typeof PRINTER_SECTORS)[number];

export const PRINT_AREAS = ["BAR", "KTV", "SPA"] as const;
export type PrintArea = (typeof PRINT_AREAS)[number];

export interface KitchenPrinter {
  id: Id;
  tenantId: string;
  locationId: string;
  name: string;
  ipAddress: string | null;
  port: number | null;
  sectors: PrinterSector[];
  printsFor: PrintArea[];
  isActive: boolean;
  deletedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}
