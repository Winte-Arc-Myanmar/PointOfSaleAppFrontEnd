"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useExchangeRate,
  useUpdateExchangeRate,
} from "@/presentation/hooks/useExchangeRates";
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

function toDateInputValue(iso: string | null | undefined): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

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

export function EditExchangeRateForm({ exchangeRateId }: { exchangeRateId: string }) {
  const router = useRouter();
  const toast = useToast();
  const { tenantId: lockedTenantId } = usePermissions();
  const update = useUpdateExchangeRate();
  const { data: rate, isLoading, error } = useExchangeRate(exchangeRateId);
  const { data: tenantsData } = useTenants();
  const tenants = getPaginatedItems(tenantsData);
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      tenantId: "",
      baseCurrency: "",
      targetCurrency: "",
      rate: "",
      effectiveFrom: "",
      effectiveTo: "",
    },
  });

  useEffect(() => {
    if (rate) {
      form.reset({
        tenantId: rate.tenantId,
        baseCurrency: rate.baseCurrency,
        targetCurrency: rate.targetCurrency,
        rate: rate.rate,
        effectiveFrom: toDateInputValue(rate.effectiveFrom),
        effectiveTo: toDateInputValue(rate.effectiveTo),
      });
    }
  }, [rate, form]);

  useEffect(() => {
    if (lockedTenantId) form.setValue("tenantId", lockedTenantId);
  }, [lockedTenantId, form]);

  const onSubmit = (data: FormData) => {
    setShowSuccess(false);
    update.mutate(
      {
        id: exchangeRateId,
        data: {
          tenantId: data.tenantId,
          baseCurrency: data.baseCurrency.trim().toUpperCase(),
          targetCurrency: data.targetCurrency.trim().toUpperCase(),
          rate: data.rate.trim(),
          effectiveFrom: data.effectiveFrom,
          effectiveTo: data.effectiveTo,
        },
      },
      {
        onSuccess: () => {
          toast.success("Exchange rate updated.");
          setShowSuccess(true);
          setTimeout(
            () => router.push(`/exchange-rates/${exchangeRateId}`),
            REDIRECT_DELAY_MS
          );
        },
        onError: () => toast.error("Failed to update exchange rate."),
      }
    );
  };

  if (isLoading) return <AppLoader fullScreen={false} size="sm" message="Loading..." />;
  if (error || !rate) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Exchange rate not found.</p>
        <Link href="/exchange-rates">
          <Button variant="outline">Back to Exchange Rates</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/exchange-rates/${exchangeRateId}`}>
          <Button variant="ghost" size="icon" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="panel-header text-xl tracking-tight">Edit exchange rate</h1>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="baseCurrency">Base currency</Label>
            <Input
              id="baseCurrency"
              {...form.register("baseCurrency")}
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
              maxLength={3}
              className="uppercase"
            />
            {form.formState.errors.targetCurrency && (
              <p className="text-sm text-red-600">{form.formState.errors.targetCurrency.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="rate">Rate</Label>
            <Input id="rate" {...form.register("rate")} />
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

        {showSuccess && (
          <p className="text-sm text-green-600 font-medium">
            Exchange rate updated successfully. Redirecting...
          </p>
        )}
        {update.isError && (
          <p className="text-sm text-red-600">Failed to update exchange rate.</p>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? "Saving..." : "Save changes"}
          </Button>
          <Link href={`/exchange-rates/${exchangeRateId}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
