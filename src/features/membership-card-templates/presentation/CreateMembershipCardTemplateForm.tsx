"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { usePermissions } from "@/presentation/hooks/usePermissions";
import { useMembershipCardTemplateFormOptions } from "@/presentation/hooks/useMembershipCardTemplateFormOptions";
import { useCreateMembershipCardTemplate } from "@/presentation/hooks/useMembershipCardTemplates";
import { useToast } from "@/presentation/providers/ToastProvider";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";

const schema = z.object({
  tenantId: z.string().min(1, "Tenant is required"),
  categoryId: z.string().min(1, "Card category is required"),
  name: z.string().min(1, "Card name is required"),
  tier: z.string().min(1, "Tier is required"),
  amount: z.number().min(0, "Amount must be zero or greater"),
  billingPeriod: z.string().min(1, "Billing period is required"),
  durationMonths: z.number().nullable(),
  rules: z.string(),
  benefits: z.string(),
  isActive: z.boolean(),
});

type FormData = z.infer<typeof schema>;

const defaultValues: FormData = {
  tenantId: "",
  categoryId: "",
  name: "",
  tier: "BRONZE",
  amount: 0,
  billingPeriod: "MONTHLY",
  durationMonths: 1,
  rules: "",
  benefits: "",
  isActive: true,
};

export function CreateMembershipCardTemplateForm({
  onSuccess,
  formId,
  onLoadingChange,
}: {
  onSuccess?: () => void;
  formId?: string;
  onLoadingChange?: (loading: boolean) => void;
}) {
  const { tenantId: lockedTenantId } = usePermissions();
  const toast = useToast();
  const create = useCreateMembershipCardTemplate();
  const { data: options } = useMembershipCardTemplateFormOptions();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { ...defaultValues, tenantId: lockedTenantId ?? "" },
  });

  const selectedTenantId = useWatch({ control: form.control, name: "tenantId" });
  const categoryOptions = useMemo(
    () =>
      (options?.categories ?? []).filter((c) =>
        selectedTenantId ? c.tenantId === selectedTenantId : false,
      ),
    [options?.categories, selectedTenantId],
  );

  useEffect(() => {
    onLoadingChange?.(create.isPending);
  }, [create.isPending, onLoadingChange]);

  useEffect(() => {
    if (lockedTenantId) form.setValue("tenantId", lockedTenantId);
  }, [lockedTenantId, form]);

  useEffect(() => {
    const current = form.getValues("categoryId");
    if (current && !categoryOptions.some((c) => c.id === current)) {
      form.setValue("categoryId", "");
    }
  }, [categoryOptions, form]);

  const submit = (data: FormData) => {
    create.mutate(
      {
        tenantId: data.tenantId,
        categoryId: data.categoryId,
        name: data.name.trim(),
        tier: data.tier,
        amount: data.amount,
        billingPeriod: data.billingPeriod,
        durationMonths: data.durationMonths,
        rules: data.rules.trim(),
        benefits: data.benefits.trim(),
        isActive: data.isActive,
      },
      {
        onSuccess: () => {
          toast.success("Membership card template created.");
          form.reset({
            ...defaultValues,
            tenantId: lockedTenantId ?? form.getValues("tenantId"),
          });
          onSuccess?.();
        },
        onError: () => toast.error("Failed to create membership card template."),
      },
    );
  };

  return (
    <form id={formId} onSubmit={form.handleSubmit(submit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="tenantId">Tenant</Label>
          <Controller
            control={form.control}
            name="tenantId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange} disabled={Boolean(lockedTenantId)}>
                <SelectTrigger id="tenantId">
                  <SelectValue placeholder="Select tenant" />
                </SelectTrigger>
                <SelectContent>
                  {(options?.tenants ?? []).map((t) => (
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
          <Label htmlFor="categoryId">Card Category</Label>
          <Controller
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange} disabled={!selectedTenantId}>
                <SelectTrigger id="categoryId">
                  <SelectValue placeholder={!selectedTenantId ? "Select tenant first" : "Select card category"} />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
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
          <Label htmlFor="name">Card Name</Label>
          <Input id="name" {...form.register("name")} placeholder="Gold Annual Card" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            min={0}
            step="0.01"
            {...form.register("amount", { valueAsNumber: true })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="tier">Tier</Label>
          <Controller
            control={form.control}
            name="tier"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="tier">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BRONZE">Bronze</SelectItem>
                  <SelectItem value="SILVER">Silver</SelectItem>
                  <SelectItem value="GOLD">Gold</SelectItem>
                  <SelectItem value="PLATINUM">Platinum</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="billingPeriod">Billing period</Label>
          <Controller
            control={form.control}
            name="billingPeriod"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="billingPeriod">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                  <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                  <SelectItem value="YEARLY">Yearly</SelectItem>
                  <SelectItem value="LIFETIME">Lifetime</SelectItem>
                  <SelectItem value="ONE_TIME">One-time</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="durationMonths">Duration (months)</Label>
          <Input
            id="durationMonths"
            type="number"
            min={0}
            step="1"
            {...form.register("durationMonths", {
              setValueAs: (v) => {
                if (v === "" || v == null) return null;
                const n = Number(v);
                return Number.isFinite(n) ? n : null;
              },
            })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="rules">Rules</Label>
          <input
            id="rules"
            {...form.register("rules")}
            className="flex h-10 w-full rounded-lg border border-gray-400 bg-white px-3 py-2 text-sm tracking-[0.02em] text-gray-900 placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint focus-visible:ring-offset-2 dark:border-border dark:bg-background dark:text-foreground"
            placeholder="Usage rules, limits, eligibility"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="benefits">Benefits</Label>
          <input
            id="benefits"
            {...form.register("benefits")}
            className="flex h-10 w-full rounded-lg border border-gray-400 bg-white px-3 py-2 text-sm tracking-[0.02em] text-gray-900 placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint focus-visible:ring-offset-2 dark:border-border dark:bg-background dark:text-foreground"
            placeholder="Discount %, points multiplier, perks"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
        <input
          type="checkbox"
          className="h-4 w-4 accent-emerald-500"
          {...form.register("isActive")}
        />
        <span className="text-sm text-foreground">Active template</span>
      </label>
    </form>
  );
}
