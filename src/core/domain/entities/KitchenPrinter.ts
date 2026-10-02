import type { Id } from "@/core/domain/types";

export const PRINTER_SECTORS = ["KDS", "CHECKOUT", "FINANCE"] as const;
export type PrinterSector = (typeof PRINTER_SECTORS)[number];

export interface KitchenPrinter {
  id: Id;
  tenantId: string;
  locationId: string;
  name: string;
  ipAddress: string;
  port: number;
  sectors: PrinterSector[];
  isActive: boolean;
  deletedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}
