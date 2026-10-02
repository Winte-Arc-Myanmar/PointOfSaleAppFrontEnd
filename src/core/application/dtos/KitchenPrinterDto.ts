import type { PrinterSector } from "@/core/domain/entities/KitchenPrinter";

export interface KitchenPrinterDto {
  id?: string;
  tenantId: string;
  locationId: string;
  name: string;
  ipAddress: string | null;
  port: number | null;
  sectors?: PrinterSector[];
  isActive: boolean;
  deletedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export type KitchenPrinterCreateDto = Pick<
  KitchenPrinterDto,
  "tenantId" | "locationId" | "name" | "ipAddress" | "port" | "sectors" | "isActive"
>;

export type KitchenPrinterUpdateDto = Pick<
  KitchenPrinterDto,
  "locationId" | "name" | "ipAddress" | "port" | "sectors" | "isActive"
>;

export type KitchenPrinterRouteCategoryDto = {
  categoryId: string;
};
