import type { Id } from "@/core/domain/types";
import type { KdsTicket, KdsTicketLine } from "@/core/domain/entities/KdsTicket";

export type CounterOrderLineStatus =
  | "PENDING"
  | "READY"
  | "SERVED"
  | string;

export interface CounterOrderLine {
  id: Id;
  salesOrderId: string;
  variantId: string;
  productName?: string | null;
  quantity: number;
  unitPrice: number;
  lineDiscount: number;
  taxRateId?: string | null;
  taxAmount: number;
  appliedPromotionId?: string | null;
  status?: CounterOrderLineStatus;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface CounterOrderKdsTicket extends KdsTicket {
  lines?: KdsTicketLine[];
}

export interface CounterOrder {
  id: Id;
  tenantId: string;
  customerId: string;
  locationId: string;
  orderNumber: string;
  salesChannel: string;
  idempotencyKey?: string | null;
  subtotal: number;
  totalDiscount: number;
  totalTax: number;
  grandTotal: number;
  status: string;
  pickedUpAt?: string | null;
  lines: CounterOrderLine[];
  kdsTickets: CounterOrderKdsTicket[];
  createdAt?: string | null;
  updatedAt?: string | null;
}
