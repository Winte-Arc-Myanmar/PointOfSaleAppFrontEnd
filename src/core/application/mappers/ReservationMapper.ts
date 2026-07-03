import type { Reservation, ReservationSeatResult } from "@/core/domain/entities/Reservation";
import type { ReservationDto, ReservationSeatResultDto } from "@/core/application/dtos/ReservationDto";
import type { TableSessionDto } from "@/core/application/dtos/TableSessionDto";
import { toTableSession } from "@/core/application/mappers/TableSessionMapper";

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function toReservation(dto: ReservationDto & { id: string }): Reservation {
  return {
    id: dto.id,
    tenantId: dto.tenantId ?? "",
    locationId: dto.locationId ?? "",
    customerId: dto.customerId ?? null,
    guestName: dto.guestName ?? "",
    guestPhone: dto.guestPhone ?? null,
    guestEmail: dto.guestEmail ?? null,
    partySize: toNumber(dto.partySize, 1),
    reservedAt: dto.reservedAt ?? "",
    estimatedDurationMins:
      dto.estimatedDurationMins == null ? null : toNumber(dto.estimatedDurationMins, 0),
    preferredZoneId: dto.preferredZoneId ?? null,
    assignedTableId: dto.assignedTableId ?? null,
    tableSessionId: dto.tableSessionId ?? null,
    specialRequests: dto.specialRequests ?? null,
    notes: dto.notes ?? null,
    status: dto.status ?? "PENDING",
    seatedAt: dto.seatedAt ?? null,
    canceledAt: dto.canceledAt ?? null,
    deletedAt: dto.deletedAt ?? null,
    createdAt: dto.createdAt ?? null,
    updatedAt: dto.updatedAt ?? null,
  };
}

export function toReservationSeatResult(
  dto: ReservationSeatResultDto,
): ReservationSeatResult {
  return {
    reservation: toReservation({
      ...(dto.reservation ?? ({} as ReservationDto)),
      id: dto.reservation?.id ?? "",
    } as ReservationDto & { id: string }),
    tableSession: toTableSession({
      ...(dto.tableSession ?? {}),
      id: dto.tableSession?.id ?? "",
    } as TableSessionDto & { id: string }),
  };
}
