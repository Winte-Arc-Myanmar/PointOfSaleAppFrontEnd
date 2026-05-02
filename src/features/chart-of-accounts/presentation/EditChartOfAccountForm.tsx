"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useChartOfAccount,
  useChartOfAccounts,
  useUpdateChartOfAccount,
} from "@/presentation/hooks/useChartOfAccounts";
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

const REDIRECT_DELAY_MS = 1500;
const PARENT_NONE = "__none__";
const ACCOUNT_TYPES = ["ASSET", "LIABILITY", "EQUITY", "REVENUE", "EXPENSE"] as const;

const schema = z.object({
  tenantId: z.string().min(1, "Tenant is required"),
  parentAccountId: z.string(),
  accountCode: z.string().min(1, "Account code is required"),
  accountName: z.string().min(1, "Account name is required"),
  accountType: z.string().min(1, "Account type is required"),
  isReconcilable: z.boolean(),
});

type FormData = z.infer<typeof schema>;

export function EditChartOfAccountForm({ chartOfAccountId }: { chartOfAccountId: string }) {
  const router = useRouter();
  const toast = useToast();
  const { tenantId: lockedTenantId } = usePermissions();
  const update = useUpdateChartOfAccount();
  const { data: account, isLoading, error } = useChartOfAccount(chartOfAccountId);
  const { data: tenants = [] } = useTenants();
  const { data: parentAccounts = [] } = useChartOfAccounts({
    page: 1,
    limit: 200,
    sortBy: "accountCode",
    sortOrder: "asc",
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      tenantId: "",
      parentAccountId: PARENT_NONE,
      accountCode: "",
      accountName: "",
      accountType: "ASSET",
      isReconcilable: true,
    },
  });

  const selectedTenantId = useWatch({
    control: form.control,
    name: "tenantId",
  });

  const filteredParents = useMemo(
    () =>
      parentAccounts.filter(
        (a) =>
          (selectedTenantId ? a.tenantId === selectedTenantId : false) &&
          String(a.id) !== chartOfAccountId
      ),
    [parentAccounts, selectedTenantId, chartOfAccountId]
  );

  useEffect(() => {
    if (account) {
      form.reset({
        tenantId: account.tenantId,
        parentAccountId: account.parentAccountId ?? PARENT_NONE,
        accountCode: account.accountCode,
        accountName: account.accountName,
        accountType: account.accountType,
        isReconcilable: account.isReconcilable,
      });
    }
  }, [account, form]);

  useEffect(() => {
    if (lockedTenantId) form.setValue("tenantId", lockedTenantId);
  }, [lockedTenantId, form]);

  useEffect(() => {
    const currentParent = form.getValues("parentAccountId");
    if (
      currentParent &&
      currentParent !== PARENT_NONE &&
      !filteredParents.some((a) => a.id === currentParent)
    ) {
      form.setValue("parentAccountId", PARENT_NONE);
    }
  }, [filteredParents, form]);

  const onSubmit = (data: FormData) => {
    setShowSuccess(false);
    update.mutate(
      {
        id: chartOfAccountId,
        data: {
          tenantId: data.tenantId,
          parentAccountId:
            !data.parentAccountId || data.parentAccountId === PARENT_NONE
              ? undefined
              : data.parentAccountId,
          accountCode: data.accountCode.trim(),
          accountName: data.accountName.trim(),
          accountType: data.accountType,
          isReconcilable: data.isReconcilable,
        },
      },
      {
        onSuccess: () => {
          toast.success("Chart account updated.");
          setShowSuccess(true);
          setTimeout(
            () => router.push(`/chart-of-accounts/${chartOfAccountId}`),
            REDIRECT_DELAY_MS
          );
        },
        onError: () => toast.error("Failed to update chart account."),
      }
    );
  };

  if (isLoading) return <AppLoader fullScreen={false} size="sm" message="Loading..." />;
  if (error || !account) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Chart account not found.</p>
        <Link href="/chart-of-accounts">
          <Button variant="outline">Back to Chart of Accounts</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/chart-of-accounts/${chartOfAccountId}`}>
          <Button variant="ghost" size="icon" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="panel-header text-xl tracking-tight">Edit chart account</h1>
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
            <Label htmlFor="parentAccountId">Parent account</Label>
            <Controller
              control={form.control}
              name="parentAccountId"
              render={({ field }) => (
                <Select
                  value={field.value ? field.value : PARENT_NONE}
                  onValueChange={field.onChange}
                  disabled={!selectedTenantId}
                >
                  <SelectTrigger id="parentAccountId">
                    <SelectValue
                      placeholder={!selectedTenantId ? "Select tenant first" : "None (root)"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={PARENT_NONE}>None (root)</SelectItem>
                    {filteredParents.map((a) => (
                      <SelectItem key={a.id} value={String(a.id)}>
                        {a.accountCode} - {a.accountName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="accountCode">Account code</Label>
            <Input id="accountCode" {...form.register("accountCode")} />
            {form.formState.errors.accountCode && (
              <p className="text-sm text-red-600">{form.formState.errors.accountCode.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="accountType">Account type</Label>
            <Controller
              control={form.control}
              name="accountType"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="accountType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACCOUNT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="accountName">Account name</Label>
          <Input id="accountName" {...form.register("accountName")} />
          {form.formState.errors.accountName && (
            <p className="text-sm text-red-600">{form.formState.errors.accountName.message}</p>
          )}
        </div>

        <label className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
          <input
            type="checkbox"
            className="h-4 w-4 accent-emerald-500"
            {...form.register("isReconcilable")}
          />
          <span className="text-sm text-foreground">Is reconcilable</span>
        </label>

        {showSuccess && (
          <p className="text-sm text-green-600 font-medium">
            Chart account updated successfully. Redirecting...
          </p>
        )}
        {update.isError && (
          <p className="text-sm text-red-600">Failed to update chart account.</p>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? "Saving..." : "Save changes"}
          </Button>
          <Link href={`/chart-of-accounts/${chartOfAccountId}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}

