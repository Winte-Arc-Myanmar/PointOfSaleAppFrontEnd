"use client";

import { useEffect } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateBundle } from "@/presentation/hooks/useBundles";
import { useProducts } from "@/presentation/hooks/useProducts";
import { useProductVariants } from "@/presentation/hooks/useProductVariants";
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

const componentSchema = z.object({
  variantId: z.string().min(1, "Variant ID is required"),
  quantity: z.number().gt(0, "Quantity must be greater than 0"),
  swapGroupId: z.string().optional(),
});

const schema = z.object({
  tenantId: z.string().min(1, "Tenant is required"),
  productId: z.string().min(1, "Product is required"),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  isActive: z.boolean(),
  components: z.array(componentSchema).min(1, "At least one component is required"),
});

type FormData = z.infer<typeof schema>;

const defaultValues: FormData = {
  tenantId: "",
  productId: "",
  name: "",
  description: "",
  isActive: true,
  components: [{ variantId: "", quantity: 1, swapGroupId: "" }],
};

export interface CreateBundleFormProps {
  onSuccess?: () => void;
  formId?: string;
  onLoadingChange?: (loading: boolean) => void;
}

export function CreateBundleForm({
  onSuccess,
  formId,
  onLoadingChange,
}: CreateBundleFormProps) {
  const { tenantId: lockedTenantId } = usePermissions();
  const toast = useToast();
  const create = useCreateBundle();

  const { data: tenantsData } = useTenants();
  const { data: productsData } = useProducts({ page: 1, limit: 200 });

  const tenants = getPaginatedItems(tenantsData);
  const products = getPaginatedItems(productsData);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...defaultValues,
      tenantId: lockedTenantId ?? "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "components",
  });

  const selectedTenantId = form.watch("tenantId");
  const selectedProductId = form.watch("productId");

  const { data: bundleProductVariants } = useProductVariants(selectedProductId || null, {
    page: 1,
    limit: 200,
  });
  const bundleVariants = getPaginatedItems(bundleProductVariants);

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
        productId: data.productId,
        name: data.name.trim(),
        description: data.description?.trim() || undefined,
        isActive: data.isActive,
        components: data.components.map((item) => ({
          variantId: item.variantId.trim(),
          quantity: item.quantity,
          swapGroupId: item.swapGroupId?.trim() || undefined,
        })),
      },
      {
        onSuccess: () => {
          toast.success("Bundle created.");
          form.reset({
            ...defaultValues,
            tenantId: lockedTenantId ?? form.getValues("tenantId"),
          });
          onSuccess?.();
        },
        onError: () => toast.error("Failed to create bundle."),
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
          <Label htmlFor="productId">Bundle product</Label>
          <Controller
            control={form.control}
            name="productId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="productId">
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {filteredProducts.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {form.formState.errors.productId && (
            <p className="text-sm text-red-600">{form.formState.errors.productId.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" placeholder="Burger Combo" {...form.register("name")} />
          {form.formState.errors.name && (
            <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            placeholder="Burger + fries + drink"
            {...form.register("description")}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
        <input
          type="checkbox"
          className="h-4 w-4 accent-emerald-500"
          {...form.register("isActive")}
        />
        <span className="text-sm text-foreground">Active bundle</span>
      </label>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Components</h3>
          <Button
            type="button"
            variant="outline"
            onClick={() => append({ variantId: "", quantity: 1, swapGroupId: "" })}
          >
            Add Component
          </Button>
        </div>

        {fields.map((field, index) => (
          <div key={field.id} className="rounded-lg border border-border p-3 space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor={`variantId-${field.id}`}>Variant ID</Label>
                <Input
                  id={`variantId-${field.id}`}
                  placeholder="Component variant UUID"
                  {...form.register(`components.${index}.variantId`)}
                />
                {bundleVariants.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {bundleVariants.slice(0, 6).map((variant) => (
                      <button
                        key={variant.id}
                        type="button"
                        className="rounded-md border border-border px-2 py-1 text-xs font-mono hover:border-mint hover:text-mint"
                        onClick={() =>
                          form.setValue(`components.${index}.variantId`, variant.id, {
                            shouldValidate: true,
                          })
                        }
                      >
                        {variant.variantSku}
                      </button>
                    ))}
                  </div>
                )}
                {form.formState.errors.components?.[index]?.variantId && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.components[index]?.variantId?.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor={`quantity-${field.id}`}>Quantity</Label>
                <Input
                  id={`quantity-${field.id}`}
                  type="number"
                  step="1"
                  {...form.register(`components.${index}.quantity`, { valueAsNumber: true })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`swapGroupId-${field.id}`}>Swap group ID (optional)</Label>
              <Input
                id={`swapGroupId-${field.id}`}
                placeholder="e.g. side"
                {...form.register(`components.${index}.swapGroupId`)}
              />
            </div>
            <div className="flex justify-end">
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

        {form.formState.errors.components?.message && (
          <p className="text-sm text-red-600">{form.formState.errors.components.message}</p>
        )}
      </div>
    </form>
  );
}
