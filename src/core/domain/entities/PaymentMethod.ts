import type { Id } from "@/core/domain/types";

export interface PaymentMethod {
  id: Id;
  tenantId: string;
  name: string;
  glAccountId: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

