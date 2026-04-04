/**
 * DTOs for vendor API request/response.
 * Application layer - matches backend contract.
 */

export interface VendorDto {
  id?: string;
  tenantId: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

