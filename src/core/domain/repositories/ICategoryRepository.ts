/**
 * Category repository interface.
 * Domain layer - defines the contract for data access.
 */

import type { Category } from "../entities/Category";
import type { CategoryDto } from "@/core/application/dtos/CategoryDto";

export interface GetCategoriesParams {
  page?: number;
  limit?: number;
}

export interface ICategoryRepository {
  getAll(params?: GetCategoriesParams): Promise<Category[]>;
  getTree(): Promise<Category[]>;
  getById(id: string): Promise<Category | null>;
  create(data: Omit<CategoryDto, "id">): Promise<Category>;
  update(id: string, data: Omit<CategoryDto, "id">): Promise<Category>;
  delete(id: string): Promise<void>;
}
