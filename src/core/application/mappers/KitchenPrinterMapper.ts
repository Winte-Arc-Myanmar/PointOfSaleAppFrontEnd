import {
  PRINTER_SECTORS,
  type KitchenPrinter,
  type PrinterSector,
} from "@/core/domain/entities/KitchenPrinter";
import type { KitchenPrinterDto } from "../dtos/KitchenPrinterDto";

export function toKitchenPrinter(dto: KitchenPrinterDto & { id: string }): KitchenPrinter {
  return {
    id: dto.id,
    tenantId: dto.tenantId ?? "",
    locationId: dto.locationId ?? "",
    name: dto.name ?? "",
    ipAddress: dto.ipAddress ?? "",
    port: Number(dto.port) || 9100,
    sectors: Array.isArray(dto.sectors)
      ? dto.sectors.filter((s): s is PrinterSector => PRINTER_SECTORS.includes(s))
      : ["KDS"],
    isActive: Boolean(dto.isActive),
    deletedAt: dto.deletedAt ?? null,
    createdAt: dto.createdAt ?? null,
    updatedAt: dto.updatedAt ?? null,
  };
}
