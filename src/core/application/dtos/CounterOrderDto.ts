import type { KdsTicketDto, KdsTicketLineDto } from "@/core/application/dtos/KdsTicketDto";

export interface CounterOrderLineDto {
  id?: string;
  salesOrderId: string;
  variantId: string;
  productName?: string | null;
  quantity: number | string;
  unitPrice: number | string;
  lineDiscount: number | string;
  taxRateId?: string | null;
  taxAmount: number | string;
  appliedPromotionId?: string | null;
  status?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface CounterOrderKdsTicketDto extends KdsTicketDto {
  lines?: KdsTicketLineDto[];
}

export interface CounterOrderDto {
  id?: string;
  tenantId: string;
  customerId: string;
  locationId: string;
  orderNumber: string;
  salesChannel: string;
  idempotencyKey?: string | null;
  subtotal: number | string;
  totalDiscount: number | string;
  totalTax: number | string;
  grandTotal: number | string;
  status: string;
  pickedUpAt?: string | null;
  lines?: CounterOrderLineDto[];
  kdsTickets?: CounterOrderKdsTicketDto[];
  createdAt?: string | null;
  updatedAt?: string | null;
}
