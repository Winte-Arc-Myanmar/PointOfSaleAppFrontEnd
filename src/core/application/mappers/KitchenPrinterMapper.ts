import {
  PRINT_AREAS,
  PRINTER_SECTORS,
  type KitchenPrinter,
  type PrintArea,
  type PrinterSector,
} from "@/core/domain/entities/KitchenPrinter";
import type { KitchenPrinterDto } from "../dtos/KitchenPrinterDto";

export function toKitchenPrinter(dto: KitchenPrinterDto & { id: string }): KitchenPrinter {
  return {
    id: dto.id,
    tenantId: dto.tenantId ?? "",
    locationId: dto.locationId ?? "",
    name: dto.name ?? "",
    ipAddress: dto.ipAddress || null,
    port: dto.ipAddress && dto.port ? Number(dto.port) : null,
    sectors: Array.isArray(dto.sectors)
      ? dto.sectors.filter((s): s is PrinterSector => PRINTER_SECTORS.includes(s))
      : ["KDS"],
    printsFor: Array.isArray(dto.printsFor)
      ? dto.printsFor.filter((a): a is PrintArea => PRINT_AREAS.includes(a))
      : [...PRINT_AREAS],
    isActive: Boolean(dto.isActive),
    deletedAt: dto.deletedAt ?? null,
    createdAt: dto.createdAt ?? null,
    updatedAt: dto.updatedAt ?? null,
  };
}
