import type { DiningTable } from "@/core/domain/entities/DiningTable";
import type { DiningTableDto } from "../dtos/DiningTableDto";

function toCoordString(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "0.00";
  if (typeof value === "number" && Number.isFinite(value)) return value.toFixed(2);
  const trimmed = String(value).trim();
  if (!trimmed) return "0.00";
  const n = Number(trimmed);
  return Number.isFinite(n) ? n.toFixed(2) : trimmed;
}

export function toDiningTable(dto: DiningTableDto & { id: string }): DiningTable {
  return {
    id: dto.id,
    tenantId: dto.tenantId ?? "",
    zoneId: dto.zoneId ?? "",
    tableNumber: dto.tableNumber ?? "",
    maxSeats: Number(dto.maxSeats) || 0,
    posX: toCoordString(dto.posX),
    posY: toCoordString(dto.posY),
    shape: dto.shape ?? "RECTANGLE",
    status: dto.status ?? "AVAILABLE",
    deletedAt: dto.deletedAt ?? null,
    createdAt: dto.createdAt ?? null,
    updatedAt: dto.updatedAt ?? null,
  };
}

export function toDiningTableDto(table: Partial<DiningTable>): DiningTableDto {
  return {
    ...(table.id && { id: String(table.id) }),
    tenantId: table.tenantId ?? "",
    zoneId: table.zoneId ?? "",
    tableNumber: table.tableNumber ?? "",
    maxSeats: table.maxSeats ?? 0,
    posX: table.posX ?? "0.00",
    posY: table.posY ?? "0.00",
    shape: table.shape ?? "RECTANGLE",
    status: table.status ?? "AVAILABLE",
    deletedAt: table.deletedAt ?? null,
    createdAt: table.createdAt ?? null,
    updatedAt: table.updatedAt ?? null,
  };
}
