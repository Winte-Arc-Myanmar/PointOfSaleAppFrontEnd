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
  serviceCharge?: number;
  /** Tax on the service charge; part of totalTax. */
  serviceChargeTax?: number;
  tipAmount?: number;
  grandTotal: number;
  status: SalesOrderStatus;
  createdAt?: string | null;
  updatedAt?: string | null;
}


/** Something to know before deleting an order; it does not stop the delete. */
export type BulkDeleteWarning = "OPEN" | "CLOSED_SHIFT";

export interface BulkDeleteOrder {
  id: string;
  orderNumber: string;
  status: string | null;
  grandTotal: number;
  createdAt: string;
  warnings: BulkDeleteWarning[];
}

export interface BulkDeleteSkipped {
  id: string;
  orderNumber: string | null;
  reason: string;
}

export interface BulkDeleteResult {
  /** Deleted, or on a preview, what would be. */
  deleted: BulkDeleteOrder[];
  skipped: BulkDeleteSkipped[];
}
