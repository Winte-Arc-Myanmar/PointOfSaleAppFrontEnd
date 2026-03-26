"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useProductVariant, useUpdateProductVariant } from "@/presentation/hooks/useProductVariants";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { AppLoader } from "@/presentation/components/loader";

const schema = z.object({
  variantSku: z.string().min(1, "Variant SKU is required"),
  matrixOptionsJson: z.string(),
  barcode: z.string(),
  priceModifier: z.number(),
});

type VariantFormData = z.infer<typeof schema>;

export interface EditVariantFormProps {
  productId: string;
  variantId: string;
  onSuccess?: () => void;
  formId?: string;
  onLoadingChange?: (loading: boolean) => void;
}

export function EditVariantForm({
  productId,
  variantId,
  onSuccess,
  formId,
  onLoadingChange,
}: EditVariantFormProps) {
  const { data: variant, isLoading, error } = useProductVariant(productId, variantId);
  const updateVariant = useUpdateProductVariant(productId);
  const [showSuccess, setShowSuccess] = useState(false);
  const form = useForm<VariantFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      variantSku: "",
      matrixOptionsJson: "{}",
      barcode: "",
      priceModifier: 0,
    },
  });

  useEffect(() => {
    if (variant) {
      form.reset({
        variantSku: variant.variantSku,
        matrixOptionsJson: JSON.stringify(variant.matrixOptions ?? {}, null, 2),
        barcode: variant.barcode ?? "",
        priceModifier: variant.priceModifier,
      });
    }
  }, [variant, form]);

  useEffect(() => {
    onLoadingChange?.(isLoading ?? updateVariant.isPending ?? false);
  }, [isLoading, updateVariant.isPending, onLoadingChange]);

  const onSubmit = (data: VariantFormData) => {
    if (!variant) return;
    setShowSuccess(false);
    let matrixOptions: Record<string, string> = {};
    try {
      if (data.matrixOptionsJson?.trim()) {
        matrixOptions = JSON.parse(data.matrixOptionsJson) as Record<string, string>;
      }
    } catch {
      // leave {}
    }
    updateVariant.mutate(
      {
        id: variantId,
        data: {
          variantSku: data.variantSku,
          matrixOptions,
          barcode: data.barcode || undefined,
          priceModifier: data.priceModifier,
        },
      },
      {
        onSuccess: () => {
          setShowSuccess(true);
          onSuccess?.();
        },
      }
    );
  };

  return (
    <form id={formId} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {isLoading && <AppLoader fullScreen={false} size="xs" message="Loading variant..." />}
      {!isLoading && (error || !variant) && (
        <p className="text-red-500">Variant not found.</p>
      )}
      {!isLoading && variant && (
        <>
      <div className="grid gap-2">
        <Label htmlFor="edit-variantSku">Variant SKU</Label>
        <Input id="edit-variantSku" {...form.register("variantSku")} />
        {form.formState.errors.variantSku && (
          <p className="text-sm text-red-600">
            {form.formState.errors.variantSku.message}
          </p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="edit-matrixOptionsJson">Matrix options (JSON)</Label>
        <Input id="edit-matrixOptionsJson" {...form.register("matrixOptionsJson")} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="edit-barcode">Barcode</Label>
        <Input id="edit-barcode" {...form.register("barcode")} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="edit-priceModifier">Price modifier</Label>
        <Input
          id="edit-priceModifier"
          type="number"
          step="0.01"
          {...form.register("priceModifier", { valueAsNumber: true })}
        />
      </div>
      {showSuccess && (
        <p className="text-sm text-green-600 font-medium">Variant updated.</p>
      )}
      {updateVariant.isError && (
        <p className="text-sm text-red-600">Failed to update variant.</p>
      )}
      {!formId && (
        <Button type="submit" disabled={updateVariant.isPending}>
          {updateVariant.isPending ? "Saving..." : "Save changes"}
        </Button>
      )}
        </>
      )}
    </form>
  );
}
