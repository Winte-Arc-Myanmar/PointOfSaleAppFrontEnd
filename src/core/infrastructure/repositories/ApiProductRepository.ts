/**
 * Product repository - fetches from external API via Axios.
 * Infrastructure layer.
 */

import type { IProductRepository } from "@/core/domain/repositories/IProductRepository";
import type { Product } from "@/core/domain/entities/Product";
import type { ProductDto } from "@/core/application/dtos/ProductDto";
import { toProduct } from "@/core/application/mappers/ProductMapper";
import type { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";

export class ApiProductRepository implements IProductRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(): Promise<Product[]> {
    const dtos = (await this.httpClient.get<ProductDto[]>(
      API_ENDPOINTS.PRODUCTS.LIST
    )) as ProductDto[];
    return dtos.map(toProduct);
  }

  async create(
    data: Omit<ProductDto, "id" | "createdAt" | "updatedAt">
  ): Promise<Product> {
    const dto = (await this.httpClient.post<ProductDto>(
      API_ENDPOINTS.PRODUCTS.CREATE,
      data
    )) as ProductDto;
    return toProduct(dto);
  }
}
