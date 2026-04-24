"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateChartOfAccount, useChartOfAccounts } from "@/presentation/hooks/useChartOfAccounts";
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

const defaultValues: FormData = {
  tenantId: "",
  parentAccountId: PARENT_NONE,
  accountCode: "",
  accountName: "",
  accountType: "ASSET",
  isReconcilable: true,
};

export interface CreateChartOfAccountFormProps {
  onSuccess?: () => void;
  formId?: string;
  onLoadingChange?: (loading: boolean) => void;
}

export function CreateChartOfAccountForm({
  onSuccess,
  formId,
  onLoadingChange,
}: CreateChartOfAccountFormProps) {
  const { tenantId: lockedTenantId } = usePermissions();
  const create = useCreateChartOfAccount();
  const toast = useToast();
  const { data: tenants = [] } = useTenants();
  const { data: parentAccounts = [] } = useChartOfAccounts({
    page: 1,
    limit: 200,
    sortBy: "accountCode",
    sortOrder: "asc",
  });

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

  const filteredParents = useMemo(
    () =>
      parentAccounts.filter((a) =>
        selectedTenantId ? a.tenantId === selectedTenantId : false
      ),
    [parentAccounts, selectedTenantId]
  );

  useEffect(() => {
    onLoadingChange?.(create.isPending ?? false);
  }, [create.isPending, onLoadingChange]);

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
    create.mutate(
      {
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
      {
        onSuccess: () => {
          toast.success("Chart account created.");
          form.reset({
            ...defaultValues,
            tenantId: lockedTenantId ?? form.getValues("tenantId"),
          });
          onSuccess?.();
        },
        onError: () => toast.error("Failed to create chart account."),
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
          <Input id="accountCode" {...form.register("accountCode")} placeholder="1000" />
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
        <Input
          id="accountName"
          {...form.register("accountName")}
          placeholder="Cash and Cash Equivalents"
        />
        {form.formState.errors.accountName && (
          <p className="text-sm text-red-600">{form.formState.errors.accountName.message}</p>
        )}
      </div>

      <label className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
        <input type="checkbox" className="h-4 w-4 accent-emerald-500" {...form.register("isReconcilable")} />
        <span className="text-sm text-foreground">Is reconcilable</span>
      </label>
    </form>
  );
}

