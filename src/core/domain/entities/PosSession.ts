import type { Id } from "@/core/domain/types";

export type PosSessionStatus = "OPEN" | "CLOSED" | string;

export interface PosSession {
  id: Id;
  tenantId: string;
  registerId: string;
  cashierId: string;
  openedAt?: string | null;
  closedAt?: string | null;
  openingCashFloat: number;
  expectedClosingCash: number;
  actualClosingCash?: number | null;
  cashVariance?: number | null;
  status: PosSessionStatus;
  updatedAt?: string | null;
}

