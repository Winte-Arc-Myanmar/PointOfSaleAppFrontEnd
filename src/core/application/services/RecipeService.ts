import type {
  RecipeCreateDto,
  RecipeUpdateDto,
} from "@/core/application/dtos/RecipeDto";
import type { Recipe } from "@/core/domain/entities/Recipe";
import type {
  GetRecipesParams,
  IRecipeRepository,
} from "@/core/domain/repositories/IRecipeRepository";
import type { IRecipeService } from "@/core/domain/services/IRecipeService";
import type { PaginatedResult } from "@/core/domain/types/pagination";

export class RecipeService implements IRecipeService {
  constructor(private readonly repository: IRecipeRepository) {}

  getAll(params?: GetRecipesParams): Promise<PaginatedResult<Recipe>> {
    return this.repository.getAll(params);
  }

  getById(id: string): Promise<Recipe | null> {
    return this.repository.getById(id);
  }

  getByVariantId(variantId: string): Promise<Recipe | null> {
    return this.repository.getByVariantId(variantId);
  }

  create(data: RecipeCreateDto): Promise<Recipe> {
    return this.repository.create(data);
  }

  update(id: string, data: RecipeUpdateDto): Promise<Recipe> {
    return this.repository.update(id, data);
  }

  delete(id: string): Promise<void> {
    return this.repository.delete(id);
  }
}
