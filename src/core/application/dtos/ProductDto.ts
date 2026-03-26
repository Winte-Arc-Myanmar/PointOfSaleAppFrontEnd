/**
 * DTOs for product API request/response.
 * Application layer - matches backend contract.
 */

export interface ProductDto {
  id?: string;
  name: string;
  tenantId: string;
  baseSku: string;
  basePrice: number;
  baseUomId: string;
  categoryId: string;
  globalAttributes?: Record<string, unknown>;
  trackingType: string;
}
