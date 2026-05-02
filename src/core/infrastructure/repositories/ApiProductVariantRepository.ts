/**
 * Product variant repository - CRUD via external API.
 * Infrastructure layer.
 */

import type {
  IProductVariantRepository,
  GetProductVariantsParams,
} from "@/core/domain/repositories/IProductVariantRepository";
import type { ProductVariant } from "@/core/domain/entities/ProductVariant";
import type { ProductVariantDto } from "@/core/application/dtos/ProductVariantDto";
import {
  toProductVariant,
} from "@/core/application/mappers/ProductVariantMapper";
import type { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";

export class ApiProductVariantRepository implements IProductVariantRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(
    productId: string,
    params?: GetProductVariantsParams
  ): Promise<ProductVariant[]> {
    const query = {
      page: params?.page ?? 1,
      limit: params?.limit ?? 10,
    };
    const endpoints = API_ENDPOINTS.PRODUCTS.VARIANTS(productId);
    const res = await this.httpClient.get<
      ProductVariantDto[] | { data?: ProductVariantDto[] }
    >(endpoints.LIST, { params: query });
    const list = Array.isArray(res) ? res : res?.data ?? [];
    const dtos = Array.isArray(list) ? list : [];
    return dtos
      .filter((dto): dto is ProductVariantDto & { id: string } => !!dto?.id)
      .map((d) => toProductVariant(productId, d));
  }

  async getById(
    productId: string,
    id: string
  ): Promise<ProductVariant | null> {
    try {
      const dto = await this.httpClient.get<ProductVariantDto>(
        API_ENDPOINTS.PRODUCTS.VARIANTS(productId).BY_ID(id)
      );
      if (!dto?.id) return null;
      return toProductVariant(productId, dto as ProductVariantDto & { id: string });
    } catch {
      return null;
    }
  }

  async create(
    productId: string,
    data: Omit<ProductVariantDto, "id">
  ): Promise<ProductVariant> {
    const dto = await this.httpClient.post<ProductVariantDto>(
      API_ENDPOINTS.PRODUCTS.VARIANTS(productId).CREATE,
      data
    );
    if (!dto?.id) throw new Error("Create variant response missing id");
    return toProductVariant(productId, dto as ProductVariantDto & { id: string });
  }

  async update(
    productId: string,
    id: string,
    data: Omit<ProductVariantDto, "id">
  ): Promise<ProductVariant> {
    const endpoints = API_ENDPOINTS.PRODUCTS.VARIANTS(productId);
    const dto = await this.httpClient.patch<ProductVariantDto>(
      endpoints.UPDATE(id),
      data
    );
    return toProductVariant(productId, {
      ...dto,
      id: dto?.id ?? id,
    } as ProductVariantDto & { id: string });
  }

  async delete(productId: string, id: string): Promise<void> {
    await this.httpClient.delete(
      API_ENDPOINTS.PRODUCTS.VARIANTS(productId).DELETE(id)
    );
  }
}


