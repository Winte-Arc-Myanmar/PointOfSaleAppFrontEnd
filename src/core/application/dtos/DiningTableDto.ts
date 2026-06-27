import type { DiningTableShape, DiningTableStatus } from "@/core/domain/entities/DiningTable";

export interface DiningTableDto {
  id?: string;
  tenantId: string;
  zoneId: string;
  tableNumber: string;
  maxSeats: number;
  posX: string | number;
  posY: string | number;
  shape: DiningTableShape;
  status: DiningTableStatus;
  deletedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export type DiningTableCreateDto = Pick<
  DiningTableDto,
  "tenantId" | "zoneId" | "tableNumber" | "maxSeats" | "shape" | "status"
> & {
  posX: number;
  posY: number;
};

export type DiningTableUpdateDto = Pick<
  DiningTableDto,
  "zoneId" | "tableNumber" | "maxSeats" | "shape" | "status"
> & {
  posX: number;
  posY: number;
};
