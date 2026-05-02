"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateInventoryLedgerEntry } from "@/presentation/hooks/useInventoryLedger";
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
import { LEDGER_TRANSACTION_TYPES } from "./ledger-constants";

const schema = z.object({
  tenantId: z.string().min(1, "Tenant is required"),
  productId: z.string().min(1, "Product is required"),
  variantId: z.string().min(1, "Variant is required"),
  locationId: z.string().min(1, "Location is required"),
  transactionType: z.string().min(1),
  referenceId: z.string(),
  quantity: z.number().min(0, "Must be ≥ 0"),
  unitCost: z.number().min(0, "Must be ≥ 0"),
  serialNumber: z.string(),
  batchNumber: z.string(),
  manufacturingDate: z.string(),
  expiryDate: z.string(),
});

export type CreateInventoryLedgerFormValues = z.infer<typeof schema>;

const defaultValues: CreateInventoryLedgerFormValues = {
  tenantId: "",
  productId: "",
  variantId: "",
  locationId: "",
  transactionType: "GRN_RECEIPT",
  referenceId: "",
  quantity: 0,
  unitCost: 0,
  serialNumber: "",
  batchNumber: "",
  manufacturingDate: "",
  expiryDate: "",
};

export interface CreateInventoryLedgerFormProps {
  onSuccess?: () => void;
  formId?: string;
  onLoadingChange?: (loading: boolean) => void;
}

export function CreateInventoryLedgerForm({
  onSuccess,
  formId,
  onLoadingChange,
}: CreateInventoryLedgerFormProps) {
  const { data: session } = useSession();
  const { tenantId: lockedTenantId } = usePermissions();
  const toast = useToast();
  const createEntry = useCreateInventoryLedgerEntry();
  const { data: tenants = [] } = useTenants();
  const { data: products = [] } = useProducts({ page: 1, limit: 200 });
  const { data: locations = [] } = useLocations({ page: 1, limit: 200 });

  useEffect(() => {
    onLoadingChange?.(createEntry.isPending ?? false);
  }, [createEntry.isPending, onLoadingChange]);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
    reset,
  } = useForm<CreateInventoryLedgerFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...defaultValues,
      tenantId: lockedTenantId ?? "",
    },
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
    if (vid && !variants.some((v) => v.id === vid)) {
      setValue("variantId", "");
    }
  }, [variants, getValues, setValue]);

  const onSubmit = (data: CreateInventoryLedgerFormValues) => {
    const userId =
      session?.user && "id" in session.user
        ? String((session.user as { id?: string }).id ?? "")
        : "";
    createEntry.mutate(
      {
        tenantId: data.tenantId,
        locationId: data.locationId,
        variantId: data.variantId,
        transactionType: data.transactionType,
        referenceId: data.referenceId.trim() || undefined,
        quantity: data.quantity,
        unitCost: data.unitCost,
        serialNumber: data.serialNumber.trim() || undefined,
        batchNumber: data.batchNumber.trim() || undefined,
        manufacturingDate: data.manufacturingDate.trim() || undefined,
        expiryDate: data.expiryDate.trim() || undefined,
        createdBy: userId.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Ledger entry created.");
          reset({
            ...defaultValues,
            tenantId: lockedTenantId ?? getValues("tenantId"),
            transactionType: "GRN_RECEIPT",
          });
          onSuccess?.();
        },
        onError: () => toast.error("Failed to create ledger entry."),
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
                <SelectValue placeholder="Select tenant" />
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
        {errors.tenantId && (
          <p className="text-sm text-red-600">{errors.tenantId.message}</p>
        )}
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
                  <SelectValue placeholder="Select product" />
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
          {errors.productId && (
            <p className="text-sm text-red-600">{errors.productId.message}</p>
          )}
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
                    placeholder={
                      variantsLoading ? "Loading…" : "Select variant"
                    }
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
          {errors.variantId && (
            <p className="text-sm text-red-600">{errors.variantId.message}</p>
          )}
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
                <SelectValue placeholder="Select location" />
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
        {errors.locationId && (
          <p className="text-sm text-red-600">{errors.locationId.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Transaction type</Label>
          <Controller
            control={control}
            name="transactionType"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEDGER_TRANSACTION_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="ledger-ref">Reference ID (optional)</Label>
          <Input
            id="ledger-ref"
            {...register("referenceId")}
            placeholder="UUID"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="ledger-qty">Quantity</Label>
          <Input
            id="ledger-qty"
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
          <Label htmlFor="ledger-cost">Unit cost</Label>
          <Input
            id="ledger-cost"
            type="number"
            step="any"
            min={0}
            {...register("unitCost", { valueAsNumber: true })}
          />
          {errors.unitCost && (
            <p className="text-sm text-red-600">{errors.unitCost.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="ledger-serial">Serial number</Label>
          <Input id="ledger-serial" {...register("serialNumber")} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="ledger-batch">Batch number</Label>
          <Input id="ledger-batch" {...register("batchNumber")} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="ledger-mfg">Manufacturing date</Label>
          <Input
            id="ledger-mfg"
            type="date"
            {...register("manufacturingDate")}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="ledger-exp">Expiry date</Label>
          <Input id="ledger-exp" type="date" {...register("expiryDate")} />
        </div>
      </div>

      {!session?.user && (
        <p className="text-xs text-muted">
          Sign in so we can send <code className="text-xs">createdBy</code> when
          your API requires it.
        </p>
      )}

      {createEntry.isError && (
        <p className="text-sm text-red-600">
          Request failed. Check values and try again.
        </p>
      )}
      {!formId && (
        <Button type="submit" disabled={createEntry.isPending}>
          {createEntry.isPending ? "Saving…" : "Create entry"}
        </Button>
      )}
    </form>
  );
}
