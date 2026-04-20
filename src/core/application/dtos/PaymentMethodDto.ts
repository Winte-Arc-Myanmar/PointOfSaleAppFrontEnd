/**
 * DTOs for payment methods API request/response.
 */

export interface PaymentMethodDto {
  id?: string;
  tenantId: string;
  name: string;
  glAccountId: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

