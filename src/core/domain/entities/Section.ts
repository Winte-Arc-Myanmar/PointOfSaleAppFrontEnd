import type { Id } from "@/core/domain/types";

export interface Section {
  id: Id;
  tenantId: string;
  locationId: string;
  name: string;
  color: string;
  deletedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}
