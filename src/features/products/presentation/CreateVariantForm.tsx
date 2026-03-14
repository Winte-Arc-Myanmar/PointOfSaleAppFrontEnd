"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateProductVariant } from "@/presentation/hooks/useProductVariants";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";

const schema = z.object({
  variantSku: z.string().min(1, "Variant SKU is required"),
  matrixOptionsJson: z.string(),
  barcode: z.string(),
  priceModifier: z.number(),
});

export type VariantFormData = z.infer<typeof schema>;

const defaultValues: VariantFormData = {
  variantSku: "",
  matrixOptionsJson: "{}",
  barcode: "",
  priceModifier: 0,
};

export interface CreateVariantFormProps {
  productId: string;
  onSuccess?: () => void;
  formId?: string;
  onLoadingChange?: (loading: boolean) => void;
}

export function CreateVariantForm({
  productId,
  onSuccess,
  formId,
  onLoadingChange,
}: CreateVariantFormProps) {
  const createVariant = useCreateProductVariant(productId);
  useEffect(() => {
    onLoadingChange?.(createVariant.isPending ?? false);
  }, [createVariant.isPending, onLoadingChange]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<VariantFormData>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const onSubmit = (data: VariantFormData) => {
    let matrixOptions: Record<string, string> = {};
    try {
      if (data.matrixOptionsJson?.trim()) {
        matrixOptions = JSON.parse(data.matrixOptionsJson) as Record<string, string>;
      }
    } catch {
      // leave {}
    }
    createVariant.mutate(
      {
        variantSku: data.variantSku,
        matrixOptions,
        barcode: data.barcode || undefined,
        priceModifier: data.priceModifier,
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
      <div className="grid gap-2">
        <Label htmlFor="variantSku">Variant SKU</Label>
        <Input
          id="variantSku"
          {...register("variantSku")}
          placeholder="SKU-IP15-BLK-128"
        />
        {errors.variantSku && (
          <p className="text-sm text-red-600">{errors.variantSku.message}</p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="matrixOptionsJson">Matrix options (JSON)</Label>
        <Input
          id="matrixOptionsJson"
          {...register("matrixOptionsJson")}
          placeholder='{"color": "Black", "storage": "128GB"}'
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="barcode">Barcode</Label>
        <Input id="barcode" {...register("barcode")} placeholder="1234567890123" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="priceModifier">Price modifier</Label>
        <Input
          id="priceModifier"
          type="number"
          step="0.01"
          {...register("priceModifier", { valueAsNumber: true })}
        />
        {errors.priceModifier && (
          <p className="text-sm text-red-600">{errors.priceModifier.message}</p>
        )}
      </div>
      {createVariant.isError && (
        <p className="text-sm text-red-600">
          Failed to create variant. Please try again.
        </p>
      )}
      {!formId && (
        <Button type="submit" disabled={createVariant.isPending}>
          {createVariant.isPending ? "Creating..." : "Create Variant"}
        </Button>
      )}
    </form>
  );
}
