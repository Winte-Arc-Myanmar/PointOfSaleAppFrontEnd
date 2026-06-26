"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useFixedAsset, useUpdateFixedAsset } from "@/presentation/hooks/useFixedAssets";
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
const LIST_LIMIT = 200;

const DEPRECIATION_METHODS = ["STRAIGHT_LINE"] as const;
const STATUSES = ["ACTIVE", "DISPOSED"] as const;

function toDateInputValue(iso: string | null | undefined): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

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

export function EditFixedAssetForm({ fixedAssetId }: { fixedAssetId: string }) {
  const router = useRouter();
  const toast = useToast();
  const { tenantId: lockedTenantId } = usePermissions();
  const update = useUpdateFixedAsset();
  const { data: asset, isLoading, error } = useFixedAsset(fixedAssetId);
  const { data: tenantsData } = useTenants();
  const tenants = getPaginatedItems(tenantsData);
  const { data: accountsData } = useChartOfAccounts({
    page: 1,
    limit: LIST_LIMIT,
    sortBy: "accountCode",
    sortOrder: "asc",
  });
  const accounts = getPaginatedItems(accountsData);
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
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
    },
  });

  const selectedTenantId = useWatch({ control: form.control, name: "tenantId" });

  const filteredAccounts = useMemo(
    () =>
      accounts.filter((a) => (selectedTenantId ? a.tenantId === selectedTenantId : false)),
    [accounts, selectedTenantId]
  );

  useEffect(() => {
    if (asset) {
      form.reset({
        tenantId: asset.tenantId,
        assetName: asset.assetName,
        serialNumber: asset.serialNumber,
        assetAccountId: asset.assetAccountId,
        depreciationExpenseAccountId: asset.depreciationExpenseAccountId,
        accumulatedDepreciationAccountId: asset.accumulatedDepreciationAccountId,
        purchaseDate: toDateInputValue(asset.purchaseDate),
        purchaseCost: asset.purchaseCost,
        salvageValue: asset.salvageValue,
        usefulLifeMonths: String(asset.usefulLifeMonths),
        depreciationMethod:
          asset.depreciationMethod === "STRAIGHT_LINE" ? "STRAIGHT_LINE" : "STRAIGHT_LINE",
        status: asset.status === "DISPOSED" ? "DISPOSED" : "ACTIVE",
      });
    }
  }, [asset, form]);

  useEffect(() => {
    if (lockedTenantId) form.setValue("tenantId", lockedTenantId);
  }, [lockedTenantId, form]);

  const onSubmit = (data: FormData) => {
    setShowSuccess(false);
    update.mutate(
      {
        id: fixedAssetId,
        data: {
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
      },
      {
        onSuccess: () => {
          toast.success("Fixed asset updated.");
          setShowSuccess(true);
          setTimeout(
            () => router.push(`/fixed-assets/${fixedAssetId}`),
            REDIRECT_DELAY_MS
          );
        },
        onError: () => toast.error("Failed to update fixed asset."),
      }
    );
  };

  if (isLoading) return <AppLoader fullScreen={false} size="sm" message="Loading..." />;
  if (error || !asset) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Fixed asset not found.</p>
        <Link href="/fixed-assets">
          <Button variant="outline">Back to Fixed Assets</Button>
        </Link>
      </div>
    );
  }

  const accountDisabled = !selectedTenantId;
  const errors = form.formState.errors;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/fixed-assets/${fixedAssetId}`}>
          <Button variant="ghost" size="icon" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="panel-header text-xl tracking-tight">Edit fixed asset</h1>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-3xl">
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
            <Label htmlFor="assetName">Asset name</Label>
            <Input id="assetName" {...form.register("assetName")} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="serialNumber">Serial number</Label>
            <Input id="serialNumber" {...form.register("serialNumber")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="purchaseDate">Purchase date</Label>
            <Input id="purchaseDate" type="date" {...form.register("purchaseDate")} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="assetAccountId">Asset account</Label>
            <Controller
              control={form.control}
              name="assetAccountId"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={accountDisabled}
                >
                  <SelectTrigger id="assetAccountId">
                    <SelectValue placeholder="Select account" />
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
          </div>
          <div className="grid gap-2">
            <Label htmlFor="depreciationExpenseAccountId">Depreciation expense account</Label>
            <Controller
              control={form.control}
              name="depreciationExpenseAccountId"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={accountDisabled}
                >
                  <SelectTrigger id="depreciationExpenseAccountId">
                    <SelectValue placeholder="Select account" />
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
          </div>
          <div className="grid gap-2">
            <Label htmlFor="accumulatedDepreciationAccountId">
              Accumulated depreciation account
            </Label>
            <Controller
              control={form.control}
              name="accumulatedDepreciationAccountId"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={accountDisabled}
                >
                  <SelectTrigger id="accumulatedDepreciationAccountId">
                    <SelectValue placeholder="Select account" />
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
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="purchaseCost">Purchase cost</Label>
            <Input id="purchaseCost" {...form.register("purchaseCost")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="salvageValue">Salvage value</Label>
            <Input id="salvageValue" {...form.register("salvageValue")} />
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

        {showSuccess && (
          <p className="text-sm text-green-600 font-medium">
            Fixed asset updated successfully. Redirecting...
          </p>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? "Saving..." : "Save changes"}
          </Button>
          <Link href={`/fixed-assets/${fixedAssetId}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
