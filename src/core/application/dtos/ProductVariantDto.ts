/**
 * DTOs for product variant API request/response.
 * Application layer - matches backend contract.
 */

export interface ProductVariantDto {
  id?: string;
  variantSku: string;
  matrixOptions: Record<string, string>;
  barcode?: string;
  priceModifier: number;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
