import type { KitchenPrinter } from "@/core/domain/entities/KitchenPrinter";
import type { KitchenPrinterDto } from "../dtos/KitchenPrinterDto";

export function toKitchenPrinter(dto: KitchenPrinterDto & { id: string }): KitchenPrinter {
  return {
    id: dto.id,
    tenantId: dto.tenantId ?? "",
    locationId: dto.locationId ?? "",
    name: dto.name ?? "",
    ipAddress: dto.ipAddress ?? "",
    port: Number(dto.port) || 9100,
    isActive: Boolean(dto.isActive),
    deletedAt: dto.deletedAt ?? null,
    createdAt: dto.createdAt ?? null,
    updatedAt: dto.updatedAt ?? null,
  };
}
