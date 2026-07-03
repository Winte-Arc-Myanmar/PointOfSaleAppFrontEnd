import type {
  CounterOrder,
  CounterOrderKdsTicket,
  CounterOrderLine,
} from "@/core/domain/entities/CounterOrder";
import type {
  CounterOrderDto,
  CounterOrderKdsTicketDto,
  CounterOrderLineDto,
} from "@/core/application/dtos/CounterOrderDto";
import { toKdsTicket, toKdsTicketLine } from "@/core/application/mappers/KdsTicketMapper";
import type { KdsTicketLineDto } from "@/core/application/dtos/KdsTicketDto";

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function toCounterOrderLine(
  dto: CounterOrderLineDto & { id: string },
): CounterOrderLine {
  return {
    id: dto.id,
    salesOrderId: dto.salesOrderId ?? "",
    variantId: dto.variantId ?? "",
    productName: dto.productName ?? null,
    quantity: toNumber(dto.quantity),
    unitPrice: toNumber(dto.unitPrice),
    lineDiscount: toNumber(dto.lineDiscount),
    taxRateId: dto.taxRateId ?? null,
    taxAmount: toNumber(dto.taxAmount),
    appliedPromotionId: dto.appliedPromotionId ?? null,
    status: dto.status,
    createdAt: dto.createdAt ?? null,
    updatedAt: dto.updatedAt ?? null,
  };
}

export function toCounterOrderKdsTicket(
  dto: CounterOrderKdsTicketDto & { id: string },
): CounterOrderKdsTicket {
  const ticket = toKdsTicket(dto);
  const lines = Array.isArray(dto.lines)
    ? dto.lines
        .filter((line): line is KdsTicketLineDto & { id: string } => !!line?.id)
        .map((line) =>
          toKdsTicketLine({
            ...line,
            id: line.id ?? "",
          } as KdsTicketLineDto & { id: string }),
        )
    : [];
  return { ...ticket, lines };
}

export function toCounterOrder(dto: CounterOrderDto & { id: string }): CounterOrder {
  const lines = Array.isArray(dto.lines)
    ? dto.lines
        .filter((line): line is CounterOrderLineDto & { id: string } => !!line?.id)
        .map((line) =>
          toCounterOrderLine({
            ...line,
            id: line.id ?? "",
          } as CounterOrderLineDto & { id: string }),
        )
    : [];
  const kdsTickets = Array.isArray(dto.kdsTickets)
    ? dto.kdsTickets
        .filter((ticket): ticket is CounterOrderKdsTicketDto & { id: string } => !!ticket?.id)
        .map((ticket) =>
          toCounterOrderKdsTicket({
            ...ticket,
            id: ticket.id ?? "",
          } as CounterOrderKdsTicketDto & { id: string }),
        )
    : [];

  return {
    id: dto.id,
    tenantId: dto.tenantId ?? "",
    customerId: dto.customerId ?? "",
    locationId: dto.locationId ?? "",
    orderNumber: dto.orderNumber ?? "",
    salesChannel: dto.salesChannel ?? "",
    idempotencyKey: dto.idempotencyKey ?? null,
    subtotal: toNumber(dto.subtotal),
    totalDiscount: toNumber(dto.totalDiscount),
    totalTax: toNumber(dto.totalTax),
    grandTotal: toNumber(dto.grandTotal),
    status: dto.status ?? "",
    pickedUpAt: dto.pickedUpAt ?? null,
    lines,
    kdsTickets,
    createdAt: dto.createdAt ?? null,
    updatedAt: dto.updatedAt ?? null,
  };
}
