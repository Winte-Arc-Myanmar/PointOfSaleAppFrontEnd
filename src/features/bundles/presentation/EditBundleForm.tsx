"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useBundle, useUpdateBundle } from "@/presentation/hooks/useBundles";
import { useProductVariants } from "@/presentation/hooks/useProductVariants";
import { useToast } from "@/presentation/providers/ToastProvider";
import { getPaginatedItems } from "@/presentation/hooks/pagination";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { AppLoader } from "@/presentation/components/loader";

const REDIRECT_DELAY_MS = 1200;

const componentSchema = z.object({
  variantId: z.string().min(1, "Variant ID is required"),
  quantity: z.number().gt(0, "Quantity must be greater than 0"),
  swapGroupId: z.string().optional(),
});

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  isActive: z.boolean(),
  components: z.array(componentSchema).min(1, "At least one component is required"),
});

type FormData = z.infer<typeof schema>;

const defaultValues: FormData = {
  name: "",
  description: "",
  isActive: true,
  components: [{ variantId: "", quantity: 1, swapGroupId: "" }],
};

export function EditBundleForm({ bundleId }: { bundleId: string }) {
  const router = useRouter();
  const toast = useToast();
  const update = useUpdateBundle();
  const { data: bundle, isLoading, error } = useBundle(bundleId);
  const [showSuccess, setShowSuccess] = useState(false);

  const { data: productVariantsResult } = useProductVariants(bundle?.productId ?? null, {
    page: 1,
    limit: 200,
  });
  const productVariants = getPaginatedItems(productVariantsResult);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "components",
  });

  useEffect(() => {
    if (!bundle) return;
    form.reset({
      name: bundle.name,
      description: bundle.description ?? "",
      isActive: bundle.isActive,
      components:
        bundle.components && bundle.components.length > 0
          ? bundle.components.map((item) => ({
              variantId: item.variantId,
              quantity: item.quantity,
              swapGroupId: item.swapGroupId ?? "",
            }))
          : defaultValues.components,
    });
  }, [bundle, form]);

  const variantShortcuts = useMemo(() => productVariants.slice(0, 8), [productVariants]);

  const onSubmit = (data: FormData) => {
    setShowSuccess(false);
    update.mutate(
      {
        id: bundleId,
        data: {
          name: data.name.trim(),
          description: data.description?.trim() || undefined,
          isActive: data.isActive,
          components: data.components.map((item) => ({
            variantId: item.variantId.trim(),
            quantity: item.quantity,
            swapGroupId: item.swapGroupId?.trim() || undefined,
          })),
        },
      },
      {
        onSuccess: () => {
          toast.success("Bundle updated.");
          setShowSuccess(true);
          setTimeout(() => router.push(`/bundles/${bundleId}`), REDIRECT_DELAY_MS);
        },
        onError: () => toast.error("Failed to update bundle."),
      },
    );
  };

  if (isLoading) return <AppLoader fullScreen={false} size="sm" message="Loading bundle..." />;

  if (error || !bundle) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Bundle not found.</p>
        <Link href="/bundles">
          <Button variant="outline">Back to Bundles</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/bundles/${bundleId}`}>
          <Button variant="ghost" size="icon" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="panel-header text-xl tracking-tight">Edit bundle</h1>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 max-w-3xl">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label>Tenant ID</Label>
            <Input value={bundle.tenantId} disabled className="font-mono" />
          </div>
          <div className="grid gap-2">
            <Label>Product ID</Label>
            <Input value={bundle.productId} disabled className="font-mono" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" {...form.register("description")} />
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
                    {...form.register(`components.${index}.variantId`)}
                  />
                  {variantShortcuts.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {variantShortcuts.map((variant) => (
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
                </div>
                <div className="grid gap-2">
                  <Label htmlFor={`quantity-${field.id}`}>Quantity</Label>
                  <Input
                    id={`quantity-${field.id}`}
                    type="number"
                    {...form.register(`components.${index}.quantity`, { valueAsNumber: true })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor={`swapGroupId-${field.id}`}>Swap group ID</Label>
                <Input
                  id={`swapGroupId-${field.id}`}
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
        </div>

        {showSuccess && (
          <p className="text-sm font-medium text-green-600">
            Bundle updated successfully. Redirecting...
          </p>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? "Saving..." : "Save changes"}
          </Button>
          <Link href={`/bundles/${bundleId}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
