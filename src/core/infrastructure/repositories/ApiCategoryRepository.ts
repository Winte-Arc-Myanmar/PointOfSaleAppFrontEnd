/**
 * Category repository 
 * Infrastructure layer.
 */

import type {
  ICategoryRepository,
  GetCategoriesParams,
} from "@/core/domain/repositories/ICategoryRepository";
import type { Category } from "@/core/domain/entities/Category";
import type { CategoryDto } from "@/core/application/dtos/CategoryDto";
import { toCategory } from "@/core/application/mappers/CategoryMapper";
import type { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";

export class ApiCategoryRepository implements ICategoryRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(params?: GetCategoriesParams): Promise<Category[]> {
    const query = {
      page: params?.page ?? 1,
      limit: params?.limit ?? 10,
    };
    const res = await this.httpClient.get<
      CategoryDto[] | { data?: CategoryDto[] }
    >(API_ENDPOINTS.CATEGORIES.LIST, { params: query });
    const list = Array.isArray(res) ? res : res?.data ?? [];
    const dtos = Array.isArray(list) ? list : [];
    return dtos
      .filter((dto): dto is CategoryDto & { id: string } => !!dto?.id)
      .map(toCategory);
  }

  async getTree(): Promise<Category[]> {
    const res = await this.httpClient.get<CategoryDto[] | { data?: CategoryDto[] }>(
      API_ENDPOINTS.CATEGORIES.TREE
    );
    const list = Array.isArray(res) ? res : res?.data ?? [];
    const dtos = (Array.isArray(list) ? list : []).filter(
      (d): d is CategoryDto & { id: string } => !!d?.id
    );
    return dtos.map(toCategory);
  }

  async getById(id: string): Promise<Category | null> {
    try {
      const dto = await this.httpClient.get<CategoryDto>(
        API_ENDPOINTS.CATEGORIES.BY_ID(id)
      );
      if (!dto?.id) return null;
      return toCategory(dto as CategoryDto & { id: string });
    } catch {
      return null;
    }
  }

  async create(data: Omit<CategoryDto, "id">): Promise<Category> {
    const dto = await this.httpClient.post<CategoryDto>(
      API_ENDPOINTS.CATEGORIES.CREATE,
      data
    );
    if (!dto?.id) throw new Error("Create category response missing id");
    return toCategory(dto as CategoryDto & { id: string });
  }

  async update(id: string, data: Omit<CategoryDto, "id">): Promise<Category> {
    const dto = await this.httpClient.patch<CategoryDto>(
      API_ENDPOINTS.CATEGORIES.UPDATE(id),
      data
    );
    return toCategory({ ...dto, id: dto?.id ?? id } as CategoryDto & {
      id: string;
    });
  }

  async delete(id: string): Promise<void> {
    await this.httpClient.delete(API_ENDPOINTS.CATEGORIES.DELETE(id));
  }
}
