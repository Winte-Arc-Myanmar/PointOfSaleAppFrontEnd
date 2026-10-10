import type { KdsTicket, KdsTicketLine } from "@/core/domain/entities/KdsTicket";
import type { KdsTicketDto, KdsTicketLineDto } from "@/core/application/dtos/KdsTicketDto";

function toOptionalNumber(value: unknown): number | null {
  if (value == null) return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const n = Number(value.trim());
    return Number.isFinite(n) ? n : null;
  }
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

const PLACE_PREFIX: Record<string, string> = {
  TABLE: "Table",
  SPA_ROOM: "SPA room",
  KTV_ROOM: "VIP Lounge",
};

function placeLabel(place: KdsTicketDto["place"]): string | null {
  if (!place?.kind) return null;
  if (place.kind === "COUNTER") return "Counter";
  const prefix = PLACE_PREFIX[place.kind] ?? place.kind;
  return place.number ? `${prefix} ${place.number}` : prefix;
}

export function toKdsTicket(dto: KdsTicketDto & { id: string }): KdsTicket {
  return {
    id: dto.id,
    tenantId: dto.tenantId ?? "",
    sessionId: dto.sessionId ?? null,
    salesOrderId: dto.salesOrderId ?? null,
    stationId: dto.stationId ?? "",
    stationName: dto.station?.name ?? null,
    placeLabel: placeLabel(dto.place),
    ticketNumber: dto.ticketNumber ?? "",
    courseType: dto.courseType ?? null,
    firedAt: dto.firedAt ?? null,
    startedAt: dto.startedAt ?? null,
    bumpedAt: dto.bumpedAt ?? null,
    status: dto.status ?? "PENDING",
    createdAt: dto.createdAt ?? null,
    updatedAt: dto.updatedAt ?? null,
  };
}

export function toKdsTicketLine(dto: KdsTicketLineDto & { id: string }): KdsTicketLine {
  return {
    id: dto.id,
    ticketId: dto.ticketId ?? "",
    salesOrderLineId: dto.salesOrderLineId ?? "",
    productName: dto.productName ?? "",
    quantity: dto.quantity ?? "0.0000",
    seatNumber: toOptionalNumber(dto.seatNumber),
    kitchenModifiers: dto.kitchenModifiers ?? null,
    status: dto.status ?? "PENDING",
    bumpedAt: dto.bumpedAt ?? null,
    createdAt: dto.createdAt ?? null,
    updatedAt: dto.updatedAt ?? null,
  };
}
