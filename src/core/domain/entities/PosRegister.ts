import type { Id } from "@/core/domain/types";

export type RegisterMode = "CASHIER" | "ROOM";

export interface PosRegister {
  id: Id;
  tenantId: string;
  locationId: string;
  name: string;
  macAddress: string;
  mode: RegisterMode;
  checkoutPrinterIds: string[];
  financePrinterIds: string[];
  createdAt?: string | null;
  updatedAt?: string | null;
}

