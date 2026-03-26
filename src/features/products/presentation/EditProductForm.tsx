"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useProduct, useUpdateProduct } from "@/presentation/hooks/useProducts";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { AppLoader } from "@/presentation/components/loader";

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

type ProductFormData = z.infer<typeof schema>;

const REDIRECT_DELAY_MS = 1500;

export function EditProductForm({ productId }: { productId: string }) {
  const router = useRouter();
  const { data: product, isLoading, error } = useProduct(productId);
  const updateProduct = useUpdateProduct();
  const [showSuccess, setShowSuccess] = useState(false);
  const form = useForm<ProductFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      tenantId: "",
      baseSku: "",
      basePrice: 0,
      baseUomId: "",
      categoryId: "",
      trackingType: "STANDARD",
      globalAttributesJson: "{}",
    },
  });

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        tenantId: product.tenantId,
        baseSku: product.baseSku,
        basePrice: product.basePrice,
        baseUomId: product.baseUomId,
        categoryId: product.categoryId,
        trackingType: product.trackingType,
        globalAttributesJson:
          typeof product.globalAttributes === "object" && product.globalAttributes
            ? JSON.stringify(product.globalAttributes, null, 2)
            : "{}",
      });
    }
  }, [product, form]);

  const onSubmit = (data: ProductFormData) => {
    setShowSuccess(false);
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
    updateProduct.mutate(
      {
        id: productId,
        data: {
          name: data.name,
          tenantId: data.tenantId,
          baseSku: data.baseSku,
          basePrice: data.basePrice,
          baseUomId: data.baseUomId,
          categoryId: data.categoryId,
          trackingType: data.trackingType,
          globalAttributes,
        },
      },
      {
        onSuccess: () => {
          form.reset(form.getValues());
          setShowSuccess(true);
          setTimeout(
            () => router.push(`/products/${productId}`),
            REDIRECT_DELAY_MS
          );
        },
      }
    );
  };

  if (isLoading) return <AppLoader fullScreen={false} size="sm" message="Loading..." />;
  if (error || !product)
    return (
      <div className="space-y-4">
        <p className="text-red-500">Product not found.</p>
        <Link href="/products">
          <Button variant="outline">Back to Products</Button>
        </Link>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/products/${productId}`}>
          <Button variant="ghost" size="icon" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="panel-header text-xl tracking-tight">Edit product</h1>
      </div>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 max-w-2xl"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-sm text-red-600">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="baseSku">Base SKU</Label>
            <Input id="baseSku" {...form.register("baseSku")} />
            {form.formState.errors.baseSku && (
              <p className="text-sm text-red-600">
                {form.formState.errors.baseSku.message}
              </p>
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
              {...form.register("basePrice", { valueAsNumber: true })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="trackingType">Tracking type</Label>
            <Input id="trackingType" {...form.register("trackingType")} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="tenantId">Tenant ID</Label>
            <Input id="tenantId" {...form.register("tenantId")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="baseUomId">Base UOM ID</Label>
            <Input id="baseUomId" {...form.register("baseUomId")} />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="categoryId">Category ID</Label>
          <Input id="categoryId" {...form.register("categoryId")} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="globalAttributesJson">Global attributes (JSON)</Label>
          <Input id="globalAttributesJson" {...form.register("globalAttributesJson")} />
        </div>
        {showSuccess && (
          <p className="text-sm text-green-600 font-medium">
            Product updated successfully. Redirecting...
          </p>
        )}
        {updateProduct.isError && (
          <p className="text-sm text-red-600">Failed to update product.</p>
        )}
        <div className="flex gap-2">
          <Button type="submit" disabled={updateProduct.isPending}>
            {updateProduct.isPending ? "Saving..." : "Save changes"}
          </Button>
          <Link href={`/products/${productId}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
