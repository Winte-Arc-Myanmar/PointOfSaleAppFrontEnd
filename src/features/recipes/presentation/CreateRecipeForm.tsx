"use client";

import { useEffect } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateRecipe } from "@/presentation/hooks/useRecipes";
import { useProducts } from "@/presentation/hooks/useProducts";
import { useProductVariants } from "@/presentation/hooks/useProductVariants";
import { useUoms } from "@/presentation/hooks/useUoms";
import { useTenants } from "@/presentation/hooks/useTenants";
import { usePermissions } from "@/presentation/hooks/usePermissions";
import { getPaginatedItems } from "@/presentation/hooks/pagination";
import { useToast } from "@/presentation/providers/ToastProvider";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";

const ingredientSchema = z.object({
  ingredientVariantId: z.string().min(1, "Ingredient variant is required"),
  quantity: z.number().gt(0, "Quantity must be greater than 0"),
  uomId: z.string().min(1, "UOM is required"),
  isOptional: z.boolean(),
  notes: z.string().optional(),
});

const schema = z.object({
  tenantId: z.string().min(1, "Tenant is required"),
  productId: z.string().optional(),
  variantId: z.string().min(1, "Variant ID is required"),
  yield: z.number().gt(0, "Yield must be greater than 0"),
  notes: z.string().optional(),
  isActive: z.boolean(),
  ingredients: z.array(ingredientSchema).min(1, "At least one ingredient is required"),
});

type FormData = z.infer<typeof schema>;

const defaultValues: FormData = {
  tenantId: "",
  productId: "",
  variantId: "",
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

export interface CreateRecipeFormProps {
  onSuccess?: () => void;
  formId?: string;
  onLoadingChange?: (loading: boolean) => void;
}

export function CreateRecipeForm({
  onSuccess,
  formId,
  onLoadingChange,
}: CreateRecipeFormProps) {
  const { tenantId: lockedTenantId } = usePermissions();
  const toast = useToast();
  const create = useCreateRecipe();

  const { data: tenantsData } = useTenants();
  const { data: productsData } = useProducts({ page: 1, limit: 200 });
  const { data: uomsData } = useUoms({ page: 1, limit: 200 });

  const tenants = getPaginatedItems(tenantsData);
  const products = getPaginatedItems(productsData);
  const uoms = getPaginatedItems(uomsData);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...defaultValues,
      tenantId: lockedTenantId ?? "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "ingredients",
  });

  const selectedTenantId = form.watch("tenantId");
  const selectedProductId = form.watch("productId");

  const { data: variantResult } = useProductVariants(
    selectedProductId ? selectedProductId : null,
    { page: 1, limit: 200 },
  );
  const variants = getPaginatedItems(variantResult);

  const filteredProducts = selectedTenantId
    ? products.filter((product) => product.tenantId === selectedTenantId)
    : products;

  useEffect(() => {
    onLoadingChange?.(create.isPending ?? false);
  }, [create.isPending, onLoadingChange]);

  useEffect(() => {
    if (lockedTenantId) form.setValue("tenantId", lockedTenantId);
  }, [lockedTenantId, form]);

  const onSubmit = (data: FormData) => {
    create.mutate(
      {
        tenantId: data.tenantId,
        variantId: data.variantId.trim(),
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
      {
        onSuccess: () => {
          toast.success("Recipe created.");
          form.reset({
            ...defaultValues,
            tenantId: lockedTenantId ?? form.getValues("tenantId"),
          });
          onSuccess?.();
        },
        onError: () => toast.error("Failed to create recipe."),
      },
    );
  };

  return (
    <form id={formId} onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="tenantId">Tenant</Label>
          <Controller
            control={form.control}
            name="tenantId"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={Boolean(lockedTenantId)}
              >
                <SelectTrigger id="tenantId">
                  <SelectValue placeholder="Select tenant" />
                </SelectTrigger>
                <SelectContent>
                  {tenants.map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {form.formState.errors.tenantId && (
            <p className="text-sm text-red-600">{form.formState.errors.tenantId.message}</p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="productId">Product (for variant lookup)</Label>
          <Controller
            control={form.control}
            name="productId"
            render={({ field }) => (
              <Select
                value={field.value || "__none__"}
                onValueChange={(value) => field.onChange(value === "__none__" ? "" : value)}
              >
                <SelectTrigger id="productId">
                  <SelectValue placeholder="Optional: select product" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No product selected</SelectItem>
                  {filteredProducts.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="variantId">Variant ID</Label>
          <Input
            id="variantId"
            placeholder="Variant UUID"
            {...form.register("variantId")}
          />
          {variants.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {variants.slice(0, 8).map((variant) => (
                <button
                  key={variant.id}
                  type="button"
                  className="rounded-md border border-border px-2 py-1 text-xs font-mono hover:border-mint hover:text-mint"
                  onClick={() => form.setValue("variantId", variant.id, { shouldValidate: true })}
                >
                  {variant.variantSku}
                </button>
              ))}
            </div>
          )}
          {form.formState.errors.variantId && (
            <p className="text-sm text-red-600">{form.formState.errors.variantId.message}</p>
          )}
        </div>

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
      </div>

      <div className="grid gap-2">
        <Label htmlFor="notes">Notes</Label>
        <Input id="notes" placeholder="Optional notes" {...form.register("notes")} />
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
                  placeholder="Variant UUID"
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
                  placeholder="Optional ingredient note"
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
    </form>
  );
}
