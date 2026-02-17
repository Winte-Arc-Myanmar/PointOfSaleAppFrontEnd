/**
 * DTOs for product request/response.
 * Application layer - depends on domain concepts only.
 */

export interface ProductDto {
  id: string;
  name: string;
  sku: string;
  priceAmount: number;
  priceCurrency: string;
  quantityInStock: number;
  createdAt: string;
  updatedAt: string;
}
