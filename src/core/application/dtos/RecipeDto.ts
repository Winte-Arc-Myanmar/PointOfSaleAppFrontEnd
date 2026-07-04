export interface RecipeIngredientDto {
  id?: string;
  recipeId?: string;
  ingredientVariantId: string;
  quantity: number | string;
  uomId: string;
  isOptional: boolean;
  notes?: string | null;
}

export interface RecipeDto {
  id?: string;
  tenantId: string;
  variantId: string;
  yield: number | string;
  notes?: string | null;
  isActive: boolean;
  ingredients?: RecipeIngredientDto[];
  deletedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export type RecipeIngredientInputDto = Pick<
  RecipeIngredientDto,
  "ingredientVariantId" | "quantity" | "uomId" | "isOptional" | "notes"
>;

export type RecipeCreateDto = Pick<
  RecipeDto,
  "tenantId" | "variantId" | "notes" | "isActive"
> & {
  yield: number;
  ingredients: RecipeIngredientInputDto[];
};

export type RecipeUpdateDto = {
  yield?: number;
  notes?: string;
  isActive?: boolean;
  ingredients?: RecipeIngredientInputDto[];
};
