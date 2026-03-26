/**
 * Product repository - CRUD via external API.
 * Infrastructure layer.
 */

import type {
  IProductRepository,
  GetProductsParams,
} from "@/core/domain/repositories/IProductRepository";
import type { Product } from "@/core/domain/entities/Product";
import type { ProductDto } from "@/core/application/dtos/ProductDto";
import { toProduct } from "@/core/application/mappers/ProductMapper";
import type { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";

export class ApiProductRepository implements IProductRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(params?: GetProductsParams): Promise<Product[]> {
    const query = {
      page: params?.page ?? 1,
      limit: params?.limit ?? 10,
    };
    const res = await this.httpClient.get<
      ProductDto[] | { data?: ProductDto[] }
    >(API_ENDPOINTS.PRODUCTS.LIST, { params: query });
    const list = Array.isArray(res) ? res : res?.data ?? [];
    const dtos = Array.isArray(list) ? list : [];
    return dtos
      .filter((dto): dto is ProductDto & { id: string } => !!dto?.id)
      .map(toProduct);
  }

  async getById(id: string): Promise<Product | null> {
    try {
      const dto = await this.httpClient.get<ProductDto>(
        API_ENDPOINTS.PRODUCTS.BY_ID(id)
      );
      if (!dto?.id) return null;
      return toProduct(dto as ProductDto & { id: string });
    } catch {
      return null;
    }
  }

  async create(data: Omit<ProductDto, "id">): Promise<Product> {
    const dto = await this.httpClient.post<ProductDto>(
      API_ENDPOINTS.PRODUCTS.CREATE,
      data
    );
    if (!dto?.id) throw new Error("Create product response missing id");
    return toProduct(dto as ProductDto & { id: string });
  }

  async update(id: string, data: Omit<ProductDto, "id">): Promise<Product> {
    const dto = await this.httpClient.patch<ProductDto>(
      API_ENDPOINTS.PRODUCTS.UPDATE(id),
      data
    );
    return toProduct({ ...dto, id: dto?.id ?? id } as ProductDto & {
      id: string;
    });
  }

  async delete(id: string): Promise<void> {
    await this.httpClient.delete(API_ENDPOINTS.PRODUCTS.DELETE(id));
  }
}
