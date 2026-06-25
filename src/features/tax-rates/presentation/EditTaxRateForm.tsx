"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTaxRate, useUpdateTaxRate } from "@/presentation/hooks/useTaxRates";
import { useChartOfAccounts } from "@/presentation/hooks/useChartOfAccounts";
import { useTenants } from "@/presentation/hooks/useTenants";
import { usePermissions } from "@/presentation/hooks/usePermissions";
import { useToast } from "@/presentation/providers/ToastProvider";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { AppLoader } from "@/presentation/components/loader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { getPaginatedItems } from "@/presentation/hooks/pagination";

const REDIRECT_DELAY_MS = 1500;

const schema = z.object({
  tenantId: z.string().min(1, "Tenant is required"),
  name: z.string().min(1, "Name is required"),
  ratePercentage: z.string().min(1, "Rate percentage is required"),
  isPriceInclusive: z.boolean(),
  glLiabilityAccountId: z.string().min(1, "GL liability account is required"),
});

type FormData = z.infer<typeof schema>;

export function EditTaxRateForm({ taxRateId }: { taxRateId: string }) {
  const router = useRouter();
  const toast = useToast();
  const { tenantId: lockedTenantId } = usePermissions();
  const update = useUpdateTaxRate();
  const { data: taxRate, isLoading, error } = useTaxRate(taxRateId);
  const { data: tenantsData } = useTenants();
  const tenants = getPaginatedItems(tenantsData);
  const { data: accountsData } = useChartOfAccounts({
    page: 1,
    limit: 200,
    sortBy: "accountCode",
    sortOrder: "asc",
  });
  const accounts = getPaginatedItems(accountsData);
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      tenantId: "",
      name: "",
      ratePercentage: "",
      isPriceInclusive: false,
      glLiabilityAccountId: "",
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
    if (taxRate) {
      form.reset({
        tenantId: taxRate.tenantId,
        name: taxRate.name,
        ratePercentage: taxRate.ratePercentage,
        isPriceInclusive: taxRate.isPriceInclusive,
        glLiabilityAccountId: taxRate.glLiabilityAccountId,
      });
    }
  }, [taxRate, form]);

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
    setShowSuccess(false);
    update.mutate(
      {
        id: taxRateId,
        data: {
          tenantId: data.tenantId,
          name: data.name.trim(),
          ratePercentage: data.ratePercentage.trim(),
          isPriceInclusive: data.isPriceInclusive,
          glLiabilityAccountId: data.glLiabilityAccountId,
        },
      },
      {
        onSuccess: () => {
          toast.success("Tax rate updated.");
          setShowSuccess(true);
          setTimeout(() => router.push(`/tax-rates/${taxRateId}`), REDIRECT_DELAY_MS);
        },
        onError: () => toast.error("Failed to update tax rate."),
      }
    );
  };

  if (isLoading) return <AppLoader fullScreen={false} size="sm" message="Loading..." />;
  if (error || !taxRate) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Tax rate not found.</p>
        <Link href="/tax-rates">
          <Button variant="outline">Back to Tax Rates</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/tax-rates/${taxRateId}`}>
          <Button variant="ghost" size="icon" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="panel-header text-xl tracking-tight">Edit tax rate</h1>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
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
            <Input id="name" {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ratePercentage">Rate percentage</Label>
            <Input id="ratePercentage" {...form.register("ratePercentage")} />
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

        {showSuccess && (
          <p className="text-sm text-green-600 font-medium">
            Tax rate updated successfully. Redirecting...
          </p>
        )}
        {update.isError && (
          <p className="text-sm text-red-600">Failed to update tax rate.</p>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? "Saving..." : "Save changes"}
          </Button>
          <Link href={`/tax-rates/${taxRateId}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
