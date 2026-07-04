import type { RecipeDto, RecipeIngredientDto } from "@/core/application/dtos/RecipeDto";
import type { Recipe, RecipeIngredient } from "@/core/domain/entities/Recipe";

function toStringValue(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return fallback;
}

function toIngredient(dto: RecipeIngredientDto): RecipeIngredient {
  return {
    id: dto.id,
    recipeId: dto.recipeId,
    ingredientVariantId: dto.ingredientVariantId ?? "",
    quantity: toStringValue(dto.quantity, "0"),
    uomId: dto.uomId ?? "",
    isOptional: Boolean(dto.isOptional),
    notes: dto.notes ?? null,
  };
}

export function toRecipe(dto: RecipeDto & { id: string }): Recipe {
  return {
    id: dto.id,
    tenantId: dto.tenantId ?? "",
    variantId: dto.variantId ?? "",
    yield: toStringValue(dto.yield, "0"),
    notes: dto.notes ?? null,
    isActive: Boolean(dto.isActive),
    ingredients: Array.isArray(dto.ingredients)
      ? dto.ingredients.map((ingredient) => toIngredient(ingredient))
      : [],
    deletedAt: dto.deletedAt ?? null,
    createdAt: dto.createdAt ?? null,
    updatedAt: dto.updatedAt ?? null,
  };
}
