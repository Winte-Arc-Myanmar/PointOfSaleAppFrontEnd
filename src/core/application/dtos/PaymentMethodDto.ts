/**
 * DTOs for payment methods API request/response.
 */

import type { PaymentMethodKind } from "@/core/domain/entities/PaymentMethod";

export interface PaymentMethodDto {
  id?: string;
  tenantId: string;
  name: string;
  kind?: PaymentMethodKind;
  isActive?: boolean;
  glAccountId: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

