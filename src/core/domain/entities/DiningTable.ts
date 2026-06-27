import type { Id } from "@/core/domain/types";

export type DiningTableShape = "RECTANGLE" | string;
export type DiningTableStatus = "AVAILABLE" | "OCCUPIED" | "DIRTY" | "RESERVED" | string;

export interface DiningTable {
  id: Id;
  tenantId: string;
  zoneId: string;
  tableNumber: string;
  maxSeats: number;
  posX: string;
  posY: string;
  shape: DiningTableShape;
  status: DiningTableStatus;
  deletedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}
