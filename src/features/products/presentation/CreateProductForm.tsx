"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateProduct } from "@/presentation/hooks/useProducts";
import { useCreateProductFormOptions } from "@/presentation/hooks/useCreateProductFormOptions";
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

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  tenantId: z.string().min(1, "Tenant is required"),
  baseSku: z.string().min(1, "Base SKU is required"),
  basePrice: z.number().min(0),
  baseUomId: z.string().min(1, "Base UOM is required"),
  categoryId: z.string().min(1, "Category is required"),
  trackingType: z.string().min(1, "Tracking type is required"),
  globalAttributesJson: z.string(),
});

export type ProductFormData = z.infer<typeof schema>;

const defaultValues: ProductFormData = {
  name: "",
  tenantId: "",
  baseSku: "",
  basePrice: 0,
  baseUomId: "",
  categoryId: "",
  trackingType: "STANDARD",
  globalAttributesJson: "{}",
};

export interface CreateProductFormProps {
  onSuccess?: () => void;
  formId?: string;
  onLoadingChange?: (loading: boolean) => void;
}

export function CreateProductForm({
  onSuccess,
  formId,
  onLoadingChange,
}: CreateProductFormProps) {
  const createProduct = useCreateProduct();
  const { data: options, isLoading: isOptionsLoading } =
    useCreateProductFormOptions();

  useEffect(() => {
    onLoadingChange?.(createProduct.isPending ?? false);
  }, [createProduct.isPending, onLoadingChange]);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    getValues,
  } = useForm<ProductFormData>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const selectedTenantId = useWatch({ control, name: "tenantId" });
  const filteredCategories = useMemo(
    () =>
      (options?.categories ?? []).filter((c) =>
        selectedTenantId ? c.tenantId === selectedTenantId : false
      ),
    [options?.categories, selectedTenantId]
  );

  useEffect(() => {
    if (isOptionsLoading) return;
    const categoryId = getValues("categoryId");
    if (
      categoryId &&
      !filteredCategories.some((c) => c.id === categoryId)
    ) {
      setValue("categoryId", "");
    }
  }, [filteredCategories, getValues, setValue, isOptionsLoading]);

  const onSubmit = (data: ProductFormData) => {
    let globalAttributes: Record<string, unknown> = {};
    try {
      if (data.globalAttributesJson?.trim()) {
        globalAttributes = JSON.parse(data.globalAttributesJson) as Record<
          string,
          unknown
        >;
      }
    } catch {
      // leave {}
    }
    createProduct.mutate(
      {
        name: data.name,
        tenantId: data.tenantId,
        baseSku: data.baseSku,
        basePrice: data.basePrice,
        baseUomId: data.baseUomId,
        categoryId: data.categoryId,
        trackingType: data.trackingType,
        globalAttributes,
      },
      {
        onSuccess: () => {
          reset(defaultValues);
          onSuccess?.();
        },
      }
    );
  };

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...register("name")} placeholder="iPhone 15" />
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="baseSku">Base SKU</Label>
          <Input id="baseSku" {...register("baseSku")} placeholder="SKU-IP15" />
          {errors.baseSku && (
            <p className="text-sm text-red-600">{errors.baseSku.message}</p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="basePrice">Base price</Label>
          <Input
            id="basePrice"
            type="number"
            step="0.01"
            {...register("basePrice", { valueAsNumber: true })}
          />
          {errors.basePrice && (
            <p className="text-sm text-red-600">{errors.basePrice.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="trackingType">Tracking type</Label>
          <Input
            id="trackingType"
            {...register("trackingType")}
            placeholder="STANDARD"
          />
          {errors.trackingType && (
            <p className="text-sm text-red-600">
              {errors.trackingType.message}
            </p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="tenantId">Tenant</Label>
          <Controller
            control={control}
            name="tenantId"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(value) => field.onChange(value)}
                disabled={isOptionsLoading}
              >
                <SelectTrigger id="tenantId">
                  <SelectValue
                    placeholder={
                      isOptionsLoading ? "Loading tenants..." : "Select tenant"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {(options?.tenants ?? []).map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.tenantId && (
            <p className="text-sm text-red-600">{errors.tenantId.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="baseUomId">Base UOM</Label>
          <Controller
            control={control}
            name="baseUomId"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(value) => field.onChange(value)}
                disabled={isOptionsLoading}
              >
                <SelectTrigger id="baseUomId">
                  <SelectValue
                    placeholder={
                      isOptionsLoading ? "Loading UOMs..." : "Select base UOM"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {(options?.uoms ?? []).map((uom) => (
                    <SelectItem key={uom.id} value={uom.id}>
                      {uom.name}
                      {uom.abbreviation ? ` (${uom.abbreviation})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.baseUomId && (
            <p className="text-sm text-red-600">{errors.baseUomId.message}</p>
          )}
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="categoryId">Category</Label>
        <Controller
          control={control}
          name="categoryId"
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={(value) => field.onChange(value)}
              disabled={isOptionsLoading || !selectedTenantId}
            >
              <SelectTrigger id="categoryId">
                <SelectValue
                  placeholder={
                    !selectedTenantId
                      ? "Select a tenant first"
                      : isOptionsLoading
                        ? "Loading categories..."
                        : "Select category"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.categoryId && (
          <p className="text-sm text-red-600">{errors.categoryId.message}</p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="globalAttributesJson">Global attributes (JSON)</Label>
        <Input
          id="globalAttributesJson"
          {...register("globalAttributesJson")}
          placeholder='{"key": "value"}'
        />
      </div>
      {createProduct.isError && (
        <p className="text-sm text-red-600">
          Failed to create product. Please try again.
        </p>
      )}
      {!formId && (
        <Button type="submit" disabled={createProduct.isPending}>
          {createProduct.isPending ? "Creating..." : "Create Product"}
        </Button>
      )}
    </form>
  );
}
