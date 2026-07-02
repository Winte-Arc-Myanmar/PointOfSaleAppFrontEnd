import type { TableSessionState } from "@/core/domain/entities/TableSession";

export type TableSessionSalesChannel = "POS" | "ONLINE" | "PHONE" | "OTHER" | string;

export interface TableSessionDto {
  id?: string;
  tenantId: string;
  tableId: string;
  locationId?: string;
  waiterId: string;
  guestCount: number;
  openedAt?: string | null;
  closedAt?: string | null;
  salesOrderId?: string | null;
  sessionState: TableSessionState;
  posRegisterId?: string | null;
  openedByPosSessionId?: string | null;
}

export interface TableSessionCreateDto {
  tenantId: string;
  tableId: string;
  locationId: string;
  guestCount: number;
  waiterId: string;
  posRegisterId: string;
  openedByPosSessionId: string;
  salesChannel: TableSessionSalesChannel;
}

export interface TableSessionUpdateDto {
  guestCount?: number;
  waiterId?: string;
}

export interface TableSessionStateTransitionDto {
  sessionState: TableSessionState;
}

export interface TableSessionLineModifierDto {
  modifierId: string;
  name: string;
  priceDelta: number;
}

export interface TableSessionAddLineDto {
  variantId: string;
  quantity: number;
  unitPrice: number;
  lineDiscount?: number;
  taxRateId?: string;
  taxAmount?: number;
  courseType?: string;
  seatNumber?: number;
  selectedModifiers?: TableSessionLineModifierDto[];
}

export interface TableSessionAllocateSeatDto {
  salesOrderLineId: string;
  seatNumber: number;
}

export interface TableSessionSeatAllocationDto {
  id?: string;
  sessionId: string;
  salesOrderLineId: string;
  seatNumber: number;
}

export interface TableSessionCheckoutPaymentDto {
  paymentMethodId: string;
  amount: number | string;
  tipAmount?: number | string;
  transactionReference?: string;
}

export interface TableSessionCheckoutDto {
  payments: TableSessionCheckoutPaymentDto[];
  tipAmount?: number;
  serviceCharge?: number;
  discountReasonId?: string;
  totalDiscount?: number;
}
