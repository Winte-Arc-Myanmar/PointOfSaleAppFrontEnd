import type { TableSessionDto } from "@/core/application/dtos/TableSessionDto";
import type { WaitlistDto, WaitlistSeatResultDto } from "@/core/application/dtos/WaitlistDto";
import { toTableSession } from "@/core/application/mappers/TableSessionMapper";
import type { WaitlistEntry, WaitlistSeatResult } from "@/core/domain/entities/Waitlist";

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function toWaitlistEntry(dto: WaitlistDto & { id: string }): WaitlistEntry {
  return {
    id: dto.id,
    tenantId: dto.tenantId ?? "",
    locationId: dto.locationId ?? "",
    customerId: dto.customerId ?? null,
    guestName: dto.guestName ?? "",
    guestPhone: dto.guestPhone ?? null,
    partySize: toNumber(dto.partySize, 1),
    joinedAt: dto.joinedAt ?? null,
    estimatedWaitMins: dto.estimatedWaitMins == null ? null : toNumber(dto.estimatedWaitMins, 0),
    preferredZoneId: dto.preferredZoneId ?? null,
    assignedTableId: dto.assignedTableId ?? null,
    tableSessionId: dto.tableSessionId ?? null,
    notifiedAt: dto.notifiedAt ?? null,
    seatedAt: dto.seatedAt ?? null,
    canceledAt: dto.canceledAt ?? null,
    notes: dto.notes ?? null,
    status: dto.status ?? "WAITING",
    createdAt: dto.createdAt ?? null,
    updatedAt: dto.updatedAt ?? null,
  };
}

export function toWaitlistSeatResult(dto: WaitlistSeatResultDto): WaitlistSeatResult {
  return {
    waitlist: toWaitlistEntry({
      ...(dto.waitlist ?? ({} as WaitlistDto)),
      id: dto.waitlist?.id ?? "",
    } as WaitlistDto & { id: string }),
    tableSession: toTableSession({
      ...(dto.tableSession ?? {}),
      id: dto.tableSession?.id ?? "",
    } as TableSessionDto & { id: string }),
  };
}
