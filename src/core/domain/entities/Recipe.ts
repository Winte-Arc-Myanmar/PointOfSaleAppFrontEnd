import type { Id } from "@/core/domain/types";

export interface RecipeIngredient {
  id?: Id;
  recipeId?: string;
  ingredientVariantId: string;
  quantity: string;
  uomId: string;
  isOptional: boolean;
  notes?: string | null;
}

export interface Recipe {
  id: Id;
  tenantId: string;
  variantId: string;
  yield: string;
  notes?: string | null;
  isActive: boolean;
  ingredients?: RecipeIngredient[];
  deletedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}
