"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateExchangeRate } from "@/presentation/hooks/useExchangeRates";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useTenants } from "@/presentation/hooks/useTenants";
import { usePermissions } from "@/presentation/hooks/usePermissions";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { getPaginatedItems } from "@/presentation/hooks/pagination";

const schema = z
  .object({
    tenantId: z.string().min(1, "Tenant is required"),
    baseCurrency: z.string().min(3, "Base currency is required").max(3),
    targetCurrency: z.string().min(3, "Target currency is required").max(3),
    rate: z.string().min(1, "Rate is required"),
    effectiveFrom: z.string().min(1, "Effective from date is required"),
    effectiveTo: z.string().min(1, "Effective to date is required"),
  })
  .refine((data) => data.effectiveTo >= data.effectiveFrom, {
    message: "Effective to must be on or after effective from",
    path: ["effectiveTo"],
  });

type FormData = z.infer<typeof schema>;

const defaultValues: FormData = {
  tenantId: "",
  baseCurrency: "",
  targetCurrency: "",
  rate: "",
  effectiveFrom: "",
  effectiveTo: "",
};

export interface CreateExchangeRateFormProps {
  onSuccess?: () => void;
  formId?: string;
  onLoadingChange?: (loading: boolean) => void;
}

export function CreateExchangeRateForm({
  onSuccess,
  formId,
  onLoadingChange,
}: CreateExchangeRateFormProps) {
  const { tenantId: lockedTenantId } = usePermissions();
  const create = useCreateExchangeRate();
  const toast = useToast();
  const { data: tenantsData } = useTenants();
  const tenants = getPaginatedItems(tenantsData);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...defaultValues,
      tenantId: lockedTenantId ?? "",
    },
  });

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
        baseCurrency: data.baseCurrency.trim().toUpperCase(),
        targetCurrency: data.targetCurrency.trim().toUpperCase(),
        rate: data.rate.trim(),
        effectiveFrom: data.effectiveFrom,
        effectiveTo: data.effectiveTo,
      },
      {
        onSuccess: () => {
          toast.success("Exchange rate created.");
          form.reset({
            ...defaultValues,
            tenantId: lockedTenantId ?? form.getValues("tenantId"),
          });
          onSuccess?.();
        },
        onError: () => toast.error("Failed to create exchange rate."),
      }
    );
  };

  return (
    <form id={formId} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                {tenants.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="baseCurrency">Base currency</Label>
          <Input
            id="baseCurrency"
            {...form.register("baseCurrency")}
            placeholder="USD"
            maxLength={3}
            className="uppercase"
          />
          {form.formState.errors.baseCurrency && (
            <p className="text-sm text-red-600">{form.formState.errors.baseCurrency.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="targetCurrency">Target currency</Label>
          <Input
            id="targetCurrency"
            {...form.register("targetCurrency")}
            placeholder="EUR"
            maxLength={3}
            className="uppercase"
          />
          {form.formState.errors.targetCurrency && (
            <p className="text-sm text-red-600">{form.formState.errors.targetCurrency.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="rate">Rate</Label>
          <Input id="rate" {...form.register("rate")} placeholder="1.0850" />
          {form.formState.errors.rate && (
            <p className="text-sm text-red-600">{form.formState.errors.rate.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="effectiveFrom">Effective from</Label>
          <Input id="effectiveFrom" type="date" {...form.register("effectiveFrom")} />
          {form.formState.errors.effectiveFrom && (
            <p className="text-sm text-red-600">{form.formState.errors.effectiveFrom.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="effectiveTo">Effective to</Label>
          <Input id="effectiveTo" type="date" {...form.register("effectiveTo")} />
          {form.formState.errors.effectiveTo && (
            <p className="text-sm text-red-600">{form.formState.errors.effectiveTo.message}</p>
          )}
        </div>
      </div>
    </form>
  );
}
