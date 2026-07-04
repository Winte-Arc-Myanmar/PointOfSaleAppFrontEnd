import type {
  RecipeCreateDto,
  RecipeDto,
  RecipeUpdateDto,
} from "@/core/application/dtos/RecipeDto";
import { toRecipe } from "@/core/application/mappers/RecipeMapper";
import type { Recipe } from "@/core/domain/entities/Recipe";
import type {
  GetRecipesParams,
  IRecipeRepository,
} from "@/core/domain/repositories/IRecipeRepository";
import type { PaginatedResult } from "@/core/domain/types/pagination";
import type { HttpClient } from "@/core/infrastructure/api/HttpClient";
import { API_ENDPOINTS } from "@/core/infrastructure/api/constants";
import {
  mapPaginatedResult,
  parsePaginatedResponse,
} from "@/core/infrastructure/api/parsePaginatedResponse";

function normalizeIngredients(
  ingredients: RecipeCreateDto["ingredients"] | RecipeUpdateDto["ingredients"],
) {
  if (!ingredients) return undefined;
  return ingredients.map((item) => ({
    ...item,
    quantity: Number(item.quantity),
  }));
}

export class ApiRecipeRepository implements IRecipeRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(params?: GetRecipesParams): Promise<PaginatedResult<Recipe>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const { data, meta } = await this.httpClient.getPaginated<unknown>(
      API_ENDPOINTS.RECIPES.LIST,
      {
        params: {
          page,
          limit,
          ...(params?.search ? { search: params.search } : {}),
          ...(params?.sortBy ? { sortBy: params.sortBy } : {}),
          ...(params?.sortOrder ? { sortOrder: params.sortOrder } : {}),
        },
      },
    );
    const parsed = parsePaginatedResponse<RecipeDto>({ data, meta }, { page, limit });
    return mapPaginatedResult(
      parsed,
      (dto) => toRecipe(dto as RecipeDto & { id: string }),
      (dto) => !!dto?.id,
    );
  }

  async getById(id: string): Promise<Recipe | null> {
    try {
      const dto = await this.httpClient.get<RecipeDto>(API_ENDPOINTS.RECIPES.BY_ID(id));
      if (!dto?.id) return null;
      return toRecipe(dto as RecipeDto & { id: string });
    } catch {
      return null;
    }
  }

  async getByVariantId(variantId: string): Promise<Recipe | null> {
    try {
      const dto = await this.httpClient.get<RecipeDto>(
        API_ENDPOINTS.RECIPES.BY_VARIANT(variantId),
      );
      if (!dto?.id) return null;
      return toRecipe(dto as RecipeDto & { id: string });
    } catch {
      return null;
    }
  }

  async create(data: RecipeCreateDto): Promise<Recipe> {
    const dto = await this.httpClient.post<RecipeDto>(API_ENDPOINTS.RECIPES.CREATE, {
      ...data,
      yield: Number(data.yield),
      ingredients: normalizeIngredients(data.ingredients),
    });
    if (!dto?.id) throw new Error("Create recipe response missing id");
    return toRecipe(dto as RecipeDto & { id: string });
  }

  async update(id: string, data: RecipeUpdateDto): Promise<Recipe> {
    const payload: RecipeUpdateDto = {
      ...data,
      ...(data.yield != null ? { yield: Number(data.yield) } : {}),
      ...(data.ingredients
        ? { ingredients: normalizeIngredients(data.ingredients) }
        : {}),
    };
    const dto = await this.httpClient.patch<RecipeDto>(
      API_ENDPOINTS.RECIPES.UPDATE(id),
      payload,
    );
    return toRecipe({
      ...dto,
      id: dto?.id ?? id,
    } as RecipeDto & { id: string });
  }

  async delete(id: string): Promise<void> {
    await this.httpClient.delete(API_ENDPOINTS.RECIPES.DELETE(id));
  }
}
