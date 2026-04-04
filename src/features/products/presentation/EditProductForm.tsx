"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useProduct, useUpdateProduct } from "@/presentation/hooks/useProducts";
import { useToast } from "@/presentation/providers/ToastProvider";
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
import { ProductImageField } from "./ProductImageField";
import { ArrowLeft } from "lucide-react";
import { AppLoader } from "@/presentation/components/loader";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  tenantId: z.string().min(1, "Tenant is required"),
  baseSku: z.string().min(1, "Base SKU is required"),
  basePrice: z.number().min(0),
  baseUomId: z.string().min(1, "Base UOM is required"),
  categoryId: z.string().min(1, "Category is required"),
  trackingType: z.string().min(1, "Tracking type is required"),
  globalAttributesJson: z.string(),
  imageUrl: z.string(),
  isTaxable: z.boolean(),
  taxRateId: z.string(),
});

type ProductFormData = z.infer<typeof schema>;

const REDIRECT_DELAY_MS = 1500;

export function EditProductForm({ productId }: { productId: string }) {
  const router = useRouter();
  const { data: product, isLoading, error } = useProduct(productId);
  const { data: options, isLoading: isOptionsLoading } =
    useCreateProductFormOptions();
  const updateProduct = useUpdateProduct();
  const toast = useToast();
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
      imageUrl: "",
      isTaxable: true,
      taxRateId: "",
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
        imageUrl: product.imageUrl ?? "",
        isTaxable: product.isTaxable ?? true,
        taxRateId: product.taxRateId ?? "",
      });
    }
  }, [product, form]);

  const selectedTenantId = useWatch({
    control: form.control,
    name: "tenantId",
  });
  const filteredCategories = useMemo(
    () =>
      (options?.categories ?? []).filter((c) =>
        selectedTenantId ? c.tenantId === selectedTenantId : false
      ),
    [options?.categories, selectedTenantId]
  );

  useEffect(() => {
    if (isOptionsLoading) return;
    const categoryId = form.getValues("categoryId");
    if (
      categoryId &&
      !filteredCategories.some((c) => c.id === categoryId)
    ) {
      form.setValue("categoryId", "");
    }
  }, [filteredCategories, form, isOptionsLoading]);

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
    const imageUrl = data.imageUrl.trim();
    const taxRateId = data.taxRateId.trim();
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
          isTaxable: data.isTaxable,
          imageUrl: imageUrl || null,
          taxRateId: taxRateId || null,
        },
      },
      {
        onSuccess: () => {
          toast.success("Product updated.");
          form.reset(form.getValues());
          setShowSuccess(true);
          setTimeout(
            () => router.push(`/products/${productId}`),
            REDIRECT_DELAY_MS
          );
        },
        onError: () => toast.error("Failed to update product."),
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
            <Label htmlFor="tenantId">Tenant</Label>
            <Controller
              control={form.control}
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
                        isOptionsLoading
                          ? "Loading tenants..."
                          : "Select tenant"
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
            {form.formState.errors.tenantId && (
              <p className="text-sm text-red-600">
                {form.formState.errors.tenantId.message}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="baseUomId">Base UOM</Label>
            <Controller
              control={form.control}
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
                        isOptionsLoading
                          ? "Loading UOMs..."
                          : "Select base UOM"
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
            {form.formState.errors.baseUomId && (
              <p className="text-sm text-red-600">
                {form.formState.errors.baseUomId.message}
              </p>
            )}
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="categoryId">Category</Label>
          <Controller
            control={form.control}
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
          {form.formState.errors.categoryId && (
            <p className="text-sm text-red-600">
              {form.formState.errors.categoryId.message}
            </p>
          )}
        </div>
        <Controller
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <ProductImageField value={field.value} onChange={field.onChange} id="edit-product-image" />
          )}
        />
        <div className="grid gap-2">
          <Label htmlFor="taxRateId">Tax rate ID</Label>
          <Input
            id="taxRateId"
            {...form.register("taxRateId")}
            placeholder="UUID when taxable"
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted">
            Paste the tax rate identifier from your billing setup. Leave empty if none.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Controller
            control={form.control}
            name="isTaxable"
            render={({ field }) => (
              <input
                id="isTaxable"
                type="checkbox"
                className="h-4 w-4 rounded border border-input"
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
              />
            )}
          />
          <Label htmlFor="isTaxable" className="font-normal cursor-pointer">
            Product is taxable
          </Label>
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
