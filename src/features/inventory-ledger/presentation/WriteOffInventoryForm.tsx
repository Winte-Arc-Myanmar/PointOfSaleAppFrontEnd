"use client";

import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useWriteOffInventory } from "@/presentation/hooks/useInventoryLedger";
import { usePermissions } from "@/presentation/hooks/usePermissions";
import { useTenants } from "@/presentation/hooks/useTenants";
import { useLocations } from "@/presentation/hooks/useLocations";
import { useProducts } from "@/presentation/hooks/useProducts";
import { useProductVariants } from "@/presentation/hooks/useProductVariants";
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

const schema = z.object({
  tenantId: z.string().min(1),
  productId: z.string().min(1, "Product is required"),
  variantId: z.string().min(1, "Variant is required"),
  locationId: z.string().min(1),
  quantity: z.number().positive("Must be > 0"),
  unitCost: z.number().min(0),
  reason: z.string().min(1, "Reason is required"),
  batchNumber: z.string(),
});

type FormValues = z.infer<typeof schema>;

const defaults: FormValues = {
  tenantId: "",
  productId: "",
  variantId: "",
  locationId: "",
  quantity: 1,
  unitCost: 0,
  reason: "",
  batchNumber: "",
};

export interface WriteOffInventoryFormProps {
  onSuccess?: () => void;
  formId?: string;
  onLoadingChange?: (loading: boolean) => void;
}

export function WriteOffInventoryForm({
  onSuccess,
  formId,
  onLoadingChange,
}: WriteOffInventoryFormProps) {
  const { tenantId: lockedTenantId } = usePermissions();
  const toast = useToast();
  const writeOff = useWriteOffInventory();
  const { data: tenants = [] } = useTenants();
  const { data: products = [] } = useProducts({ page: 1, limit: 200 });
  const { data: locations = [] } = useLocations({ page: 1, limit: 200 });

  useEffect(() => {
    onLoadingChange?.(writeOff.isPending ?? false);
  }, [writeOff.isPending, onLoadingChange]);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { ...defaults, tenantId: lockedTenantId ?? "" },
  });

  const tenantWatch = useWatch({ control, name: "tenantId" });
  const productWatch = useWatch({ control, name: "productId" });
  const { data: variants = [], isLoading: variantsLoading } =
    useProductVariants(productWatch || null, { page: 1, limit: 100 });

  const filteredLocations = locations.filter((l) =>
    tenantWatch ? l.tenantId === tenantWatch : false,
  );

  useEffect(() => {
    if (lockedTenantId) setValue("tenantId", lockedTenantId);
  }, [lockedTenantId, setValue]);

  useEffect(() => {
    const vid = getValues("variantId");
    if (vid && !variants.some((v) => v.id === vid)) setValue("variantId", "");
  }, [variants, getValues, setValue]);

  const onSubmit = (data: FormValues) => {
    writeOff.mutate(
      {
        tenantId: data.tenantId,
        variantId: data.variantId,
        locationId: data.locationId,
        quantity: data.quantity,
        unitCost: data.unitCost,
        reason: data.reason,
        batchNumber: data.batchNumber.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Stock written off.");
          reset({
            ...defaults,
            tenantId: lockedTenantId ?? getValues("tenantId"),
          });
          onSuccess?.();
        },
        onError: () => toast.error("Write-off failed."),
      },
    );
  };

  return (
    <form
      id={formId}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 max-h-[70vh] overflow-y-auto pr-1"
    >
      <div className="grid gap-2">
        <Label>Tenant</Label>
        <Controller
          control={control}
          name="tenantId"
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={(v) => {
                field.onChange(v);
                setValue("locationId", "");
              }}
              disabled={!!lockedTenantId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tenant" />
              </SelectTrigger>
              <SelectContent>
                {tenants.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Product</Label>
          <Controller
            control={control}
            name="productId"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(v) => {
                  field.onChange(v);
                  setValue("variantId", "");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="grid gap-2">
          <Label>Variant</Label>
          <Controller
            control={control}
            name="variantId"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={!productWatch || variantsLoading}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={variantsLoading ? "…" : "Variant"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {variants.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.variantSku}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label>Location</Label>
        <Controller
          control={control}
          name="locationId"
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={!tenantWatch}
            >
              <SelectTrigger>
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                {filteredLocations.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="wo-qty">Quantity</Label>
          <Input
            id="wo-qty"
            type="number"
            step="any"
            min={0}
            {...register("quantity", { valueAsNumber: true })}
          />
          {errors.quantity && (
            <p className="text-sm text-red-600">{errors.quantity.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="wo-cost">Unit cost</Label>
          <Input
            id="wo-cost"
            type="number"
            step="any"
            min={0}
            {...register("unitCost", { valueAsNumber: true })}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="wo-reason">Reason</Label>
        <Input
          id="wo-reason"
          {...register("reason")}
          placeholder="e.g. Expired batch BATCH-001"
        />
        {errors.reason && (
          <p className="text-sm text-red-600">{errors.reason.message}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="wo-batch">Batch number (optional)</Label>
        <Input id="wo-batch" {...register("batchNumber")} />
      </div>

      {!formId && (
        <Button type="submit" disabled={writeOff.isPending}>
          {writeOff.isPending ? "Submitting…" : "Submit write-off"}
        </Button>
      )}
    </form>
  );
}
