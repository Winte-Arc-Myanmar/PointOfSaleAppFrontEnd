"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateBankStatement } from "@/presentation/hooks/useBankStatements";
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

const LIST_LIMIT = 200;

const schema = z.object({
  tenantId: z.string().min(1, "Tenant is required"),
  glAccountId: z.string().min(1, "GL account is required"),
  statementDate: z.string().min(1, "Statement date is required"),
  openingBalance: z.string().min(1, "Opening balance is required"),
  closingBalance: z.string().min(1, "Closing balance is required"),
});

type FormData = z.infer<typeof schema>;

const defaultValues: FormData = {
  tenantId: "",
  glAccountId: "",
  statementDate: "",
  openingBalance: "0.0000",
  closingBalance: "0.0000",
};

export interface CreateBankStatementFormProps {
  onSuccess?: () => void;
  formId?: string;
  onLoadingChange?: (loading: boolean) => void;
}

export function CreateBankStatementForm({
  onSuccess,
  formId,
  onLoadingChange,
}: CreateBankStatementFormProps) {
  const { tenantId: lockedTenantId } = usePermissions();
  const create = useCreateBankStatement();
  const toast = useToast();
  const { data: tenantsData } = useTenants();
  const tenants = getPaginatedItems(tenantsData);
  const { data: accountsData } = useChartOfAccounts({
    page: 1,
    limit: LIST_LIMIT,
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

  const selectedTenantId = useWatch({ control: form.control, name: "tenantId" });

  const filteredAccounts = useMemo(
    () =>
      accounts.filter((a) => (selectedTenantId ? a.tenantId === selectedTenantId : false)),
    [accounts, selectedTenantId]
  );

  useEffect(() => {
    onLoadingChange?.(create.isPending ?? false);
  }, [create.isPending, onLoadingChange]);

  useEffect(() => {
    if (lockedTenantId) form.setValue("tenantId", lockedTenantId);
  }, [lockedTenantId, form]);

  useEffect(() => {
    const current = form.getValues("glAccountId");
    if (current && !filteredAccounts.some((a) => a.id === current)) {
      form.setValue("glAccountId", "");
    }
  }, [filteredAccounts, form]);

  const onSubmit = (data: FormData) => {
    create.mutate(
      {
        tenantId: data.tenantId,
        glAccountId: data.glAccountId,
        statementDate: data.statementDate,
        openingBalance: data.openingBalance.trim(),
        closingBalance: data.closingBalance.trim(),
      },
      {
        onSuccess: () => {
          toast.success("Bank statement created.");
          form.reset({
            ...defaultValues,
            tenantId: lockedTenantId ?? form.getValues("tenantId"),
          });
          onSuccess?.();
        },
        onError: () => toast.error("Failed to create bank statement."),
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
          <Label htmlFor="glAccountId">GL account</Label>
          <Controller
            control={form.control}
            name="glAccountId"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={!selectedTenantId}
              >
                <SelectTrigger id="glAccountId">
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
          {form.formState.errors.glAccountId && (
            <p className="text-sm text-red-600">{form.formState.errors.glAccountId.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="statementDate">Statement date</Label>
        <Input id="statementDate" type="date" {...form.register("statementDate")} />
        {form.formState.errors.statementDate && (
          <p className="text-sm text-red-600">{form.formState.errors.statementDate.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="openingBalance">Opening balance</Label>
          <Input id="openingBalance" {...form.register("openingBalance")} placeholder="10000.0000" />
          {form.formState.errors.openingBalance && (
            <p className="text-sm text-red-600">{form.formState.errors.openingBalance.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="closingBalance">Closing balance</Label>
          <Input id="closingBalance" {...form.register("closingBalance")} placeholder="12500.0000" />
          {form.formState.errors.closingBalance && (
            <p className="text-sm text-red-600">{form.formState.errors.closingBalance.message}</p>
          )}
        </div>
      </div>
    </form>
  );
}
