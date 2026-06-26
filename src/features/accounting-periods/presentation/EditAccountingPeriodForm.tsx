"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useAccountingPeriod,
  useUpdateAccountingPeriod,
} from "@/presentation/hooks/useAccountingPeriods";
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
const PERIOD_STATUSES = ["OPEN", "CLOSED"] as const;

function toDateInputValue(iso: string | null | undefined): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

const schema = z
  .object({
    tenantId: z.string().min(1, "Tenant is required"),
    periodName: z.string().min(1, "Period name is required"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    status: z.string().min(1, "Status is required"),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "End date must be on or after start date",
    path: ["endDate"],
  });

type FormData = z.infer<typeof schema>;

export function EditAccountingPeriodForm({ accountingPeriodId }: { accountingPeriodId: string }) {
  const router = useRouter();
  const toast = useToast();
  const { tenantId: lockedTenantId } = usePermissions();
  const update = useUpdateAccountingPeriod();
  const { data: period, isLoading, error } = useAccountingPeriod(accountingPeriodId);
  const { data: tenantsData } = useTenants();
  const tenants = getPaginatedItems(tenantsData);
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      tenantId: "",
      periodName: "",
      startDate: "",
      endDate: "",
      status: "OPEN",
    },
  });

  useEffect(() => {
    if (period) {
      form.reset({
        tenantId: period.tenantId,
        periodName: period.periodName,
        startDate: toDateInputValue(period.startDate),
        endDate: toDateInputValue(period.endDate),
        status: period.status,
      });
    }
  }, [period, form]);

  useEffect(() => {
    if (lockedTenantId) form.setValue("tenantId", lockedTenantId);
  }, [lockedTenantId, form]);

  const onSubmit = (data: FormData) => {
    setShowSuccess(false);
    update.mutate(
      {
        id: accountingPeriodId,
        data: {
          tenantId: data.tenantId,
          periodName: data.periodName.trim(),
          startDate: data.startDate,
          endDate: data.endDate,
          status: data.status,
        },
      },
      {
        onSuccess: () => {
          toast.success("Accounting period updated.");
          setShowSuccess(true);
          setTimeout(
            () => router.push(`/accounting-periods/${accountingPeriodId}`),
            REDIRECT_DELAY_MS
          );
        },
        onError: () => toast.error("Failed to update accounting period."),
      }
    );
  };

  if (isLoading) return <AppLoader fullScreen={false} size="sm" message="Loading..." />;
  if (error || !period) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Accounting period not found.</p>
        <Link href="/accounting-periods">
          <Button variant="outline">Back to Accounting Periods</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/accounting-periods/${accountingPeriodId}`}>
          <Button variant="ghost" size="icon" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="panel-header text-xl tracking-tight">Edit accounting period</h1>
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
            <Label htmlFor="status">Status</Label>
            <Controller
              control={form.control}
              name="status"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {PERIOD_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="periodName">Period name</Label>
          <Input id="periodName" {...form.register("periodName")} />
          {form.formState.errors.periodName && (
            <p className="text-sm text-red-600">{form.formState.errors.periodName.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="startDate">Start date</Label>
            <Input id="startDate" type="date" {...form.register("startDate")} />
            {form.formState.errors.startDate && (
              <p className="text-sm text-red-600">{form.formState.errors.startDate.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="endDate">End date</Label>
            <Input id="endDate" type="date" {...form.register("endDate")} />
            {form.formState.errors.endDate && (
              <p className="text-sm text-red-600">{form.formState.errors.endDate.message}</p>
            )}
          </div>
        </div>

        {showSuccess && (
          <p className="text-sm text-green-600 font-medium">
            Accounting period updated successfully. Redirecting...
          </p>
        )}
        {update.isError && (
          <p className="text-sm text-red-600">Failed to update accounting period.</p>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? "Saving..." : "Save changes"}
          </Button>
          <Link href={`/accounting-periods/${accountingPeriodId}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
