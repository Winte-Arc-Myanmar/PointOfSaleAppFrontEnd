import type { Id } from "@/core/domain/types";

export interface KitchenPrinter {
  id: Id;
  tenantId: string;
  locationId: string;
  name: string;
  ipAddress: string;
  port: number;
  isActive: boolean;
  deletedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}
