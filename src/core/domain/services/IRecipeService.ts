import type {
  RecipeCreateDto,
  RecipeUpdateDto,
} from "@/core/application/dtos/RecipeDto";
import type { Recipe } from "../entities/Recipe";
import type {
  GetRecipesParams,
  IRecipeRepository,
} from "../repositories/IRecipeRepository";
import type { PaginatedResult } from "../types/pagination";

export interface IRecipeService extends IRecipeRepository {}

export type { GetRecipesParams };
