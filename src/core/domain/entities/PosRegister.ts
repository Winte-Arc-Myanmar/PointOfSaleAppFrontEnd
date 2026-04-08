import type { Id } from "@/core/domain/types";

export interface PosRegister {
  id: Id;
  tenantId: string;
  locationId: string;
  name: string;
  macAddress: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

