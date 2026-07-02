import type {
  TableSession,
  TableSessionSeatAllocation,
} from "@/core/domain/entities/TableSession";
import type {
  TableSessionDto,
  TableSessionSeatAllocationDto,
} from "@/core/application/dtos/TableSessionDto";

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function toTableSession(dto: TableSessionDto & { id: string }): TableSession {
  return {
    id: dto.id,
    tenantId: dto.tenantId ?? "",
    tableId: dto.tableId ?? "",
    locationId: dto.locationId ?? undefined,
    waiterId: dto.waiterId ?? "",
    guestCount: toNumber(dto.guestCount, 1),
    openedAt: dto.openedAt ?? null,
    closedAt: dto.closedAt ?? null,
    salesOrderId: dto.salesOrderId ?? null,
    sessionState: dto.sessionState ?? "SEATED",
    posRegisterId: dto.posRegisterId ?? null,
    openedByPosSessionId: dto.openedByPosSessionId ?? null,
  };
}

export function toTableSessionSeatAllocation(
  dto: TableSessionSeatAllocationDto & { id: string },
): TableSessionSeatAllocation {
  return {
    id: dto.id,
    sessionId: dto.sessionId ?? "",
    salesOrderLineId: dto.salesOrderLineId ?? "",
    seatNumber: toNumber(dto.seatNumber, 1),
  };
}
