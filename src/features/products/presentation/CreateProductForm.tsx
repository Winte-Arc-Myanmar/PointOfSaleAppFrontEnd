"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateProduct } from "@/presentation/hooks/useProducts";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  tenantId: z.string().min(1, "Tenant ID is required"),
  baseSku: z.string().min(1, "Base SKU is required"),
  basePrice: z.number().min(0),
  baseUomId: z.string().min(1, "UOM ID is required"),
  categoryId: z.string().min(1, "Category ID is required"),
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
  useEffect(() => {
    onLoadingChange?.(createProduct.isPending ?? false);
  }, [createProduct.isPending, onLoadingChange]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProductFormData>({
    resolver: zodResolver(schema),
    defaultValues,
  });

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
          <Label htmlFor="tenantId">Tenant ID</Label>
          <Input id="tenantId" {...register("tenantId")} placeholder="uuid" />
          {errors.tenantId && (
            <p className="text-sm text-red-600">{errors.tenantId.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="baseUomId">Base UOM ID</Label>
          <Input id="baseUomId" {...register("baseUomId")} placeholder="uuid" />
          {errors.baseUomId && (
            <p className="text-sm text-red-600">{errors.baseUomId.message}</p>
          )}
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="categoryId">Category ID</Label>
        <Input id="categoryId" {...register("categoryId")} placeholder="uuid" />
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
