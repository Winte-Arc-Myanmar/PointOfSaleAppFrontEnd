"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateLoyaltyLedgerEntry } from "@/presentation/hooks/useLoyaltyLedger";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useTenants } from "@/presentation/hooks/useTenants";
import { usePermissions } from "@/presentation/hooks/usePermissions";
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
import { LOYALTY_TRANSACTION_TYPES } from "./loyalty-ledger-constants";

const schema = z.object({
  tenantId: z.string().min(1, "Tenant is required"),
  transactionType: z.string().min(1, "Transaction type is required"),
  points: z.number().int(),
  referenceOrderId: z.string(),
  expiryDate: z.string(),
});

type FormData = z.infer<typeof schema>;

const defaultValues: FormData = {
  tenantId: "",
  transactionType: "EARN",
  points: 0,
  referenceOrderId: "",
  expiryDate: "",
};

function defaultTenantValues(lockedTenantId: string | undefined) {
  return { ...defaultValues, tenantId: lockedTenantId ?? "" };
}

export interface CreateLoyaltyLedgerFormProps {
  customerId: string;
  onSuccess?: () => void;
  formId?: string;
  onLoadingChange?: (loading: boolean) => void;
}

export function CreateLoyaltyLedgerForm({
  customerId,
  onSuccess,
  formId,
  onLoadingChange,
}: CreateLoyaltyLedgerFormProps) {
  const { tenantId: lockedTenantId } = usePermissions();
  const createEntry = useCreateLoyaltyLedgerEntry();
  const toast = useToast();
  const { data: tenants = [], isLoading: isTenantsLoading } = useTenants();

  useEffect(() => {
    onLoadingChange?.(createEntry.isPending ?? false);
  }, [createEntry.isPending, onLoadingChange]);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: defaultTenantValues(lockedTenantId),
  });

  useEffect(() => {
    if (lockedTenantId) setValue("tenantId", lockedTenantId);
  }, [lockedTenantId, setValue]);

  const onSubmit = (data: FormData) => {
    createEntry.mutate(
      {
        customerId,
        data: {
          tenantId: data.tenantId,
          transactionType: data.transactionType,
          points: data.points,
          referenceOrderId: data.referenceOrderId.trim() || undefined,
          expiryDate: data.expiryDate.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success("Loyalty entry created.");
          reset(defaultTenantValues(lockedTenantId));
          onSuccess?.();
        },
        onError: () => toast.error("Failed to create loyalty entry."),
      }
    );
  };

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="tenantId">Tenant</Label>
        <Controller
          control={control}
          name="tenantId"
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={isTenantsLoading || Boolean(lockedTenantId)}
            >
              <SelectTrigger id="tenantId">
                <SelectValue
                  placeholder={
                    isTenantsLoading ? "Loading tenants..." : "Select tenant"
                  }
                />
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
          <Label htmlFor="transactionType">Transaction type</Label>
          <Controller
            control={control}
            name="transactionType"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="transactionType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {LOYALTY_TRANSACTION_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.transactionType && (
            <p className="text-sm text-red-600">{errors.transactionType.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="points">Points</Label>
          <Input
            id="points"
            type="number"
            {...register("points", { valueAsNumber: true })}
          />
          {errors.points && (
            <p className="text-sm text-red-600">{errors.points.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="referenceOrderId">Reference order ID (optional)</Label>
        <Input
          id="referenceOrderId"
          {...register("referenceOrderId")}
          placeholder="UUID"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="expiryDate">Expiry date (optional)</Label>
        <Input id="expiryDate" type="date" {...register("expiryDate")} />
      </div>

      {createEntry.isError && (
        <p className="text-sm text-red-600">
          Failed to create loyalty entry. Please try again.
        </p>
      )}

      {!formId && (
        <Button type="submit" disabled={createEntry.isPending}>
          {createEntry.isPending ? "Creating..." : "Create entry"}
        </Button>
      )}
    </form>
  );
}
