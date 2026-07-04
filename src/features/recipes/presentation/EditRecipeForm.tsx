"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRecipe, useUpdateRecipe } from "@/presentation/hooks/useRecipes";
import { useUoms } from "@/presentation/hooks/useUoms";
import { getPaginatedItems } from "@/presentation/hooks/pagination";
import { useToast } from "@/presentation/providers/ToastProvider";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { AppLoader } from "@/presentation/components/loader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";

const REDIRECT_DELAY_MS = 1200;

const ingredientSchema = z.object({
  ingredientVariantId: z.string().min(1, "Ingredient variant is required"),
  quantity: z.number().gt(0, "Quantity must be greater than 0"),
  uomId: z.string().min(1, "UOM is required"),
  isOptional: z.boolean(),
  notes: z.string().optional(),
});

const schema = z.object({
  yield: z.number().gt(0, "Yield must be greater than 0"),
  notes: z.string().optional(),
  isActive: z.boolean(),
  ingredients: z.array(ingredientSchema).min(1, "At least one ingredient is required"),
});

type FormData = z.infer<typeof schema>;

const defaultValues: FormData = {
  yield: 1,
  notes: "",
  isActive: true,
  ingredients: [
    {
      ingredientVariantId: "",
      quantity: 1,
      uomId: "",
      isOptional: false,
      notes: "",
    },
  ],
};

export function EditRecipeForm({ recipeId }: { recipeId: string }) {
  const toast = useToast();
  const update = useUpdateRecipe();
  const { data: recipe, isLoading, error } = useRecipe(recipeId);
  const { data: uomsData } = useUoms({ page: 1, limit: 200 });
  const [showSuccess, setShowSuccess] = useState(false);

  const uoms = getPaginatedItems(uomsData);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "ingredients",
  });

  useEffect(() => {
    if (!recipe) return;
    form.reset({
      yield: Number(recipe.yield),
      notes: recipe.notes ?? "",
      isActive: recipe.isActive,
      ingredients:
        recipe.ingredients && recipe.ingredients.length > 0
          ? recipe.ingredients.map((ingredient) => ({
              ingredientVariantId: ingredient.ingredientVariantId,
              quantity: Number(ingredient.quantity),
              uomId: ingredient.uomId,
              isOptional: ingredient.isOptional,
              notes: ingredient.notes ?? "",
            }))
          : defaultValues.ingredients,
    });
  }, [recipe, form]);

  const onSubmit = (data: FormData) => {
    setShowSuccess(false);
    update.mutate(
      {
        id: recipeId,
        data: {
          yield: data.yield,
          notes: data.notes?.trim() || undefined,
          isActive: data.isActive,
          ingredients: data.ingredients.map((ingredient) => ({
            ingredientVariantId: ingredient.ingredientVariantId.trim(),
            quantity: ingredient.quantity,
            uomId: ingredient.uomId,
            isOptional: ingredient.isOptional,
            notes: ingredient.notes?.trim() || undefined,
          })),
        },
      },
      {
        onSuccess: () => {
          toast.success("Recipe updated.");
          setShowSuccess(true);
          setTimeout(() => {
            window.location.assign(`/recipes/${recipeId}`);
          }, REDIRECT_DELAY_MS);
        },
        onError: () => toast.error("Failed to update recipe."),
      },
    );
  };

  if (isLoading) return <AppLoader fullScreen={false} size="sm" message="Loading recipe..." />;

  if (error || !recipe) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Recipe not found.</p>
        <Link href="/recipes">
          <Button variant="outline">Back to Recipes</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/recipes/${recipeId}`}>
          <Button variant="ghost" size="icon" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="panel-header text-xl tracking-tight">Edit recipe</h1>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 max-w-3xl">
        <div className="grid gap-2">
          <Label>Tenant ID</Label>
          <Input value={recipe.tenantId} disabled className="font-mono" />
        </div>

        <div className="grid gap-2">
          <Label>Variant ID</Label>
          <Input value={recipe.variantId} disabled className="font-mono" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="yield">Yield</Label>
            <Input
              id="yield"
              type="number"
              step="0.0001"
              {...form.register("yield", { valueAsNumber: true })}
            />
            {form.formState.errors.yield && (
              <p className="text-sm text-red-600">{form.formState.errors.yield.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" {...form.register("notes")} />
          </div>
        </div>

        <label className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
          <input
            type="checkbox"
            className="h-4 w-4 accent-emerald-500"
            {...form.register("isActive")}
          />
          <span className="text-sm text-foreground">Active recipe</span>
        </label>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Ingredients</h3>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                append({
                  ingredientVariantId: "",
                  quantity: 1,
                  uomId: "",
                  isOptional: false,
                  notes: "",
                })
              }
            >
              Add Ingredient
            </Button>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="rounded-lg border border-border p-3 space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor={`ingredientVariantId-${field.id}`}>Ingredient Variant ID</Label>
                  <Input
                    id={`ingredientVariantId-${field.id}`}
                    {...form.register(`ingredients.${index}.ingredientVariantId`)}
                  />
                  {form.formState.errors.ingredients?.[index]?.ingredientVariantId && (
                    <p className="text-sm text-red-600">
                      {form.formState.errors.ingredients[index]?.ingredientVariantId?.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor={`quantity-${field.id}`}>Quantity</Label>
                  <Input
                    id={`quantity-${field.id}`}
                    type="number"
                    step="0.0001"
                    {...form.register(`ingredients.${index}.quantity`, {
                      valueAsNumber: true,
                    })}
                  />
                  {form.formState.errors.ingredients?.[index]?.quantity && (
                    <p className="text-sm text-red-600">
                      {form.formState.errors.ingredients[index]?.quantity?.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor={`uom-${field.id}`}>UOM</Label>
                  <Controller
                    control={form.control}
                    name={`ingredients.${index}.uomId`}
                    render={({ field: uomField }) => (
                      <Select value={uomField.value} onValueChange={uomField.onChange}>
                        <SelectTrigger id={`uom-${field.id}`}>
                          <SelectValue placeholder="Select UOM" />
                        </SelectTrigger>
                        <SelectContent>
                          {uoms.map((uom) => (
                            <SelectItem key={uom.id} value={uom.id}>
                              {uom.name} ({uom.abbreviation})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {form.formState.errors.ingredients?.[index]?.uomId && (
                    <p className="text-sm text-red-600">
                      {form.formState.errors.ingredients[index]?.uomId?.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor={`ingredientNotes-${field.id}`}>Notes</Label>
                  <Input
                    id={`ingredientNotes-${field.id}`}
                    {...form.register(`ingredients.${index}.notes`)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-emerald-500"
                    {...form.register(`ingredients.${index}.isOptional`)}
                  />
                  Optional ingredient
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}

          {form.formState.errors.ingredients?.message && (
            <p className="text-sm text-red-600">{form.formState.errors.ingredients.message}</p>
          )}
        </div>

        {showSuccess && (
          <p className="text-sm font-medium text-green-600">
            Recipe updated successfully. Redirecting...
          </p>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? "Saving..." : "Save changes"}
          </Button>
          <Link href={`/recipes/${recipeId}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
