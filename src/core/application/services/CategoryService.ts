/**
 * Category service implementation.
 * Application layer - delegates to ICategoryRepository.
 */

import type { ICategoryService } from "@/core/domain/services/ICategoryService";
import type { ICategoryRepository } from "@/core/domain/repositories/ICategoryRepository";
import type { Category } from "@/core/domain/entities/Category";
import type { CategoryDto } from "../dtos/CategoryDto";
import type { GetCategoriesParams } from "@/core/domain/repositories/ICategoryRepository";

export class CategoryService implements ICategoryService {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async getAll(params?: GetCategoriesParams): Promise<Category[]> {
    return this.categoryRepository.getAll(params);
  }

  async getTree(): Promise<Category[]> {
    return this.categoryRepository.getTree();
  }

  async getById(id: string): Promise<Category | null> {
    return this.categoryRepository.getById(id);
  }

  async create(data: Omit<CategoryDto, "id">): Promise<Category> {
    return this.categoryRepository.create(data);
  }

  async update(id: string, data: Omit<CategoryDto, "id">): Promise<Category> {
    return this.categoryRepository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    return this.categoryRepository.delete(id);
  }
}
