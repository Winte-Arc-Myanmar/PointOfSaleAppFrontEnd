import type { Id } from "@/core/domain/types";

export interface DiningZone {
  id: Id;
  tenantId: string;
  name: string;
  layoutSvg: string;
  sortOrder: number;
  deletedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}
