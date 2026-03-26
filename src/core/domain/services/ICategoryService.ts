/**
 * Category service interface.
 * Domain layer - defines the contract for category operations.
 */

import type { Category } from "../entities/Category";
import type { CategoryDto } from "@/core/application/dtos/CategoryDto";
import type { GetCategoriesParams } from "../repositories/ICategoryRepository";

export interface ICategoryService {
  getAll(params?: GetCategoriesParams): Promise<Category[]>;
  getTree(): Promise<Category[]>;
  getById(id: string): Promise<Category | null>;
  create(data: Omit<CategoryDto, "id">): Promise<Category>;
  update(id: string, data: Omit<CategoryDto, "id">): Promise<Category>;
  delete(id: string): Promise<void>;
}
