"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateFixedAsset } from "@/presentation/hooks/useFixedAssets";
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

const DEPRECIATION_METHODS = ["STRAIGHT_LINE"] as const;
const STATUSES = ["ACTIVE", "DISPOSED"] as const;

const schema = z.object({
  tenantId: z.string().min(1, "Tenant is required"),
  assetName: z.string().min(1, "Asset name is required"),
  serialNumber: z.string().min(1, "Serial number is required"),
  assetAccountId: z.string().min(1, "Asset account is required"),
  depreciationExpenseAccountId: z.string().min(1, "Depreciation expense account is required"),
  accumulatedDepreciationAccountId: z
    .string()
    .min(1, "Accumulated depreciation account is required"),
  purchaseDate: z.string().min(1, "Purchase date is required"),
  purchaseCost: z.string().min(1, "Purchase cost is required"),
  salvageValue: z.string().min(1, "Salvage value is required"),
  usefulLifeMonths: z
    .string()
    .min(1, "Useful life is required")
    .refine((v) => {
      const n = Number(v);
      return Number.isInteger(n) && n >= 1;
    }, "Useful life must be at least 1 month"),
  depreciationMethod: z.enum(DEPRECIATION_METHODS),
  status: z.enum(STATUSES),
});

type FormData = z.infer<typeof schema>;

const defaultValues: FormData = {
  tenantId: "",
  assetName: "",
  serialNumber: "",
  assetAccountId: "",
  depreciationExpenseAccountId: "",
  accumulatedDepreciationAccountId: "",
  purchaseDate: "",
  purchaseCost: "0.0000",
  salvageValue: "0.0000",
  usefulLifeMonths: "60",
  depreciationMethod: "STRAIGHT_LINE",
  status: "ACTIVE",
};

export interface CreateFixedAssetFormProps {
  onSuccess?: () => void;
  formId?: string;
  onLoadingChange?: (loading: boolean) => void;
}

function AccountSelect({
  id,
  label,
  value,
  onChange,
  accounts,
  disabled,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  accounts: { id: string | number; accountCode: string; accountName: string }[];
  disabled?: boolean;
  error?: string;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id={id}>
          <SelectValue placeholder={disabled ? "Select tenant first" : "Select account"} />
        </SelectTrigger>
        <SelectContent>
          {accounts.map((a) => (
            <SelectItem key={a.id} value={String(a.id)}>
              {a.accountCode} - {a.accountName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

export function CreateFixedAssetForm({
  onSuccess,
  formId,
  onLoadingChange,
}: CreateFixedAssetFormProps) {
  const { tenantId: lockedTenantId } = usePermissions();
  const create = useCreateFixedAsset();
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
    for (const field of [
      "assetAccountId",
      "depreciationExpenseAccountId",
      "accumulatedDepreciationAccountId",
    ] as const) {
      const current = form.getValues(field);
      if (current && !filteredAccounts.some((a) => String(a.id) === current)) {
        form.setValue(field, "");
      }
    }
  }, [filteredAccounts, form]);

  const onSubmit = (data: FormData) => {
    create.mutate(
      {
        tenantId: data.tenantId,
        assetName: data.assetName.trim(),
        serialNumber: data.serialNumber.trim(),
        assetAccountId: data.assetAccountId,
        depreciationExpenseAccountId: data.depreciationExpenseAccountId,
        accumulatedDepreciationAccountId: data.accumulatedDepreciationAccountId,
        purchaseDate: data.purchaseDate,
        purchaseCost: data.purchaseCost.trim(),
        salvageValue: data.salvageValue.trim(),
        usefulLifeMonths: Number(data.usefulLifeMonths),
        depreciationMethod: data.depreciationMethod,
        status: data.status,
      },
      {
        onSuccess: () => {
          toast.success("Fixed asset created.");
          form.reset({
            ...defaultValues,
            tenantId: lockedTenantId ?? form.getValues("tenantId"),
          });
          onSuccess?.();
        },
        onError: () => toast.error("Failed to create fixed asset."),
      }
    );
  };

  const accountDisabled = !selectedTenantId;
  const errors = form.formState.errors;

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
          {errors.tenantId && (
            <p className="text-sm text-red-600">{errors.tenantId.message}</p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="assetName">Asset name</Label>
          <Input id="assetName" {...form.register("assetName")} placeholder="Office Laptop" />
          {errors.assetName && (
            <p className="text-sm text-red-600">{errors.assetName.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="serialNumber">Serial number</Label>
          <Input id="serialNumber" {...form.register("serialNumber")} placeholder="SN-12345" />
          {errors.serialNumber && (
            <p className="text-sm text-red-600">{errors.serialNumber.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="purchaseDate">Purchase date</Label>
          <Input id="purchaseDate" type="date" {...form.register("purchaseDate")} />
          {errors.purchaseDate && (
            <p className="text-sm text-red-600">{errors.purchaseDate.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Controller
          control={form.control}
          name="assetAccountId"
          render={({ field }) => (
            <AccountSelect
              id="assetAccountId"
              label="Asset account"
              value={field.value}
              onChange={field.onChange}
              accounts={filteredAccounts}
              disabled={accountDisabled}
              error={errors.assetAccountId?.message}
            />
          )}
        />
        <Controller
          control={form.control}
          name="depreciationExpenseAccountId"
          render={({ field }) => (
            <AccountSelect
              id="depreciationExpenseAccountId"
              label="Depreciation expense account"
              value={field.value}
              onChange={field.onChange}
              accounts={filteredAccounts}
              disabled={accountDisabled}
              error={errors.depreciationExpenseAccountId?.message}
            />
          )}
        />
        <Controller
          control={form.control}
          name="accumulatedDepreciationAccountId"
          render={({ field }) => (
            <AccountSelect
              id="accumulatedDepreciationAccountId"
              label="Accumulated depreciation account"
              value={field.value}
              onChange={field.onChange}
              accounts={filteredAccounts}
              disabled={accountDisabled}
              error={errors.accumulatedDepreciationAccountId?.message}
            />
          )}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="purchaseCost">Purchase cost</Label>
          <Input id="purchaseCost" {...form.register("purchaseCost")} placeholder="1500.0000" />
          {errors.purchaseCost && (
            <p className="text-sm text-red-600">{errors.purchaseCost.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="salvageValue">Salvage value</Label>
          <Input id="salvageValue" {...form.register("salvageValue")} placeholder="200.0000" />
          {errors.salvageValue && (
            <p className="text-sm text-red-600">{errors.salvageValue.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="usefulLifeMonths">Useful life (months)</Label>
          <Input
            id="usefulLifeMonths"
            type="number"
            min={1}
            {...form.register("usefulLifeMonths")}
          />
          {errors.usefulLifeMonths && (
            <p className="text-sm text-red-600">{errors.usefulLifeMonths.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="depreciationMethod">Depreciation method</Label>
          <Controller
            control={form.control}
            name="depreciationMethod"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="depreciationMethod">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEPRECIATION_METHODS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m.replace(/_/g, " ")}
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
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>
    </form>
  );
}
