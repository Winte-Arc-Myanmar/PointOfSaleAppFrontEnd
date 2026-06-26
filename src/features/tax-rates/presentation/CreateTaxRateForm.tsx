"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateTaxRate } from "@/presentation/hooks/useTaxRates";
import { useChartOfAccounts } from "@/presentation/hooks/useChartOfAccounts";
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

const schema = z.object({
  tenantId: z.string().min(1, "Tenant is required"),
  name: z.string().min(1, "Name is required"),
  ratePercentage: z.string().min(1, "Rate percentage is required"),
  isPriceInclusive: z.boolean(),
  glLiabilityAccountId: z.string().min(1, "GL liability account is required"),
});

type FormData = z.infer<typeof schema>;

const defaultValues: FormData = {
  tenantId: "",
  name: "",
  ratePercentage: "",
  isPriceInclusive: false,
  glLiabilityAccountId: "",
};

export interface CreateTaxRateFormProps {
  onSuccess?: () => void;
  formId?: string;
  onLoadingChange?: (loading: boolean) => void;
}

export function CreateTaxRateForm({
  onSuccess,
  formId,
  onLoadingChange,
}: CreateTaxRateFormProps) {
  const { tenantId: lockedTenantId } = usePermissions();
  const create = useCreateTaxRate();
  const toast = useToast();
  const { data: tenantsData } = useTenants();
  const tenants = getPaginatedItems(tenantsData);
  const { data: accountsData } = useChartOfAccounts({
    page: 1,
    limit: 200,
    sortBy: "accountCode",
    sortOrder: "asc",
  });
  const accounts = getPaginatedItems(accountsData);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...defaultValues,
      tenantId: lockedTenantId ?? "",
    },
  });

  const selectedTenantId = useWatch({
    control: form.control,
    name: "tenantId",
  });

  const filteredAccounts = useMemo(
    () =>
      accounts.filter((a) =>
        selectedTenantId ? a.tenantId === selectedTenantId : false
      ),
    [accounts, selectedTenantId]
  );

  useEffect(() => {
    onLoadingChange?.(create.isPending ?? false);
  }, [create.isPending, onLoadingChange]);

  useEffect(() => {
    if (lockedTenantId) form.setValue("tenantId", lockedTenantId);
  }, [lockedTenantId, form]);

  useEffect(() => {
    const current = form.getValues("glLiabilityAccountId");
    if (current && !filteredAccounts.some((a) => a.id === current)) {
      form.setValue("glLiabilityAccountId", "");
    }
  }, [filteredAccounts, form]);

  const onSubmit = (data: FormData) => {
    create.mutate(
      {
        tenantId: data.tenantId,
        name: data.name.trim(),
        ratePercentage: data.ratePercentage.trim(),
        isPriceInclusive: data.isPriceInclusive,
        glLiabilityAccountId: data.glLiabilityAccountId,
      },
      {
        onSuccess: () => {
          toast.success("Tax rate created.");
          form.reset({
            ...defaultValues,
            tenantId: lockedTenantId ?? form.getValues("tenantId"),
          });
          onSuccess?.();
        },
        onError: () => toast.error("Failed to create tax rate."),
      }
    );
  };

  return (
    <form id={formId} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

        <div className="grid gap-2">
          <Label htmlFor="glLiabilityAccountId">GL liability account</Label>
          <Controller
            control={form.control}
            name="glLiabilityAccountId"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={!selectedTenantId}
              >
                <SelectTrigger id="glLiabilityAccountId">
                  <SelectValue
                    placeholder={!selectedTenantId ? "Select tenant first" : "Select account"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {filteredAccounts.map((a) => (
                    <SelectItem key={a.id} value={String(a.id)}>
                      {a.accountCode} - {a.accountName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {form.formState.errors.glLiabilityAccountId && (
            <p className="text-sm text-red-600">
              {form.formState.errors.glLiabilityAccountId.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...form.register("name")} placeholder="VAT Standard" />
          {form.formState.errors.name && (
            <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="ratePercentage">Rate percentage</Label>
          <Input id="ratePercentage" {...form.register("ratePercentage")} placeholder="15.0000" />
          {form.formState.errors.ratePercentage && (
            <p className="text-sm text-red-600">{form.formState.errors.ratePercentage.message}</p>
          )}
        </div>
      </div>

      <label className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
        <input
          type="checkbox"
          className="h-4 w-4 accent-emerald-500"
          {...form.register("isPriceInclusive")}
        />
        <span className="text-sm text-foreground">Price inclusive</span>
      </label>
    </form>
  );
}
