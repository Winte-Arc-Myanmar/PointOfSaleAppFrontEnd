import type {
  RecipeCreateDto,
  RecipeUpdateDto,
} from "@/core/application/dtos/RecipeDto";
import type { Recipe } from "../entities/Recipe";
import type { PaginatedResult } from "../types/pagination";

export interface GetRecipesParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc" | string;
}

export interface IRecipeRepository {
  getAll(params?: GetRecipesParams): Promise<PaginatedResult<Recipe>>;
  getById(id: string): Promise<Recipe | null>;
  getByVariantId(variantId: string): Promise<Recipe | null>;
  create(data: RecipeCreateDto): Promise<Recipe>;
  update(id: string, data: RecipeUpdateDto): Promise<Recipe>;
  delete(id: string): Promise<void>;
}
