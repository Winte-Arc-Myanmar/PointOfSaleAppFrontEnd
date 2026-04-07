import type { Id } from "@/core/domain/types";

export type SalesOrderStatus =
  | "DRAFT"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | string;

export type SalesChannel = "POS" | "ONLINE" | "PHONE" | "OTHER" | string;

export interface SalesOrder {
  id: Id;
  tenantId: string;
  customerId: string;
  locationId: string;
  orderNumber: string;
  salesChannel: SalesChannel;
  idempotencyKey?: string | null;
  subtotal: number;
  totalDiscount: number;
  totalTax: number;
  grandTotal: number;
  status: SalesOrderStatus;
  createdAt?: string | null;
  updatedAt?: string | null;
}

