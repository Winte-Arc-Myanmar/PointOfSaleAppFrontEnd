import type { Id } from "@/core/domain/types";

export type PosKind = "BAR" | "KTV" | "SPA";
export type ShiftRule = "PER_LOGIN" | "DAILY";

export interface PosRegister {
  id: Id;
  tenantId: string;
  locationId: string;
  name: string;
  macAddress: string;
  sellsAt: PosKind[];
  shiftRule: ShiftRule;
  checkoutPrinterIds: string[];
  financePrinterIds: string[];
  createdAt?: string | null;
  updatedAt?: string | null;
}

