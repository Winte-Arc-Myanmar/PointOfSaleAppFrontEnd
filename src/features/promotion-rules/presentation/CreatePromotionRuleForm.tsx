"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreatePromotionRule } from "@/presentation/hooks/usePromotionRules";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useTenants } from "@/presentation/hooks/useTenants";
import { Button } from "@/presentation/components/ui/button";
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
  name: z.string().min(1, "Name is required"),
  eligibilityCriteriaJson: z.string(),
  rewardType: z.string().min(1, "Reward type is required"),
  rewardValue: z.number(),
  priorityLevel: z.number(),
  isStackable: z.boolean(),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
});

type FormData = z.infer<typeof schema>;

const defaultValues: FormData = {
  tenantId: "",
  name: "",
  eligibilityCriteriaJson: "{\"category\":\"Electronics\"}",
  rewardType: "PERCENTAGE_DISCOUNT",
  rewardValue: 10,
  priorityLevel: 0,
  isStackable: false,
  startDate: "",
  endDate: "",
};

function toIsoOrEmpty(dtLocal: string): string {
  if (!dtLocal.trim()) return "";
  const d = new Date(dtLocal);
  return Number.isFinite(d.getTime()) ? d.toISOString() : "";
}

export interface CreatePromotionRuleFormProps {
  onSuccess?: () => void;
  formId?: string;
  onLoadingChange?: (loading: boolean) => void;
}

export function CreatePromotionRuleForm({
  onSuccess,
  formId,
  onLoadingChange,
}: CreatePromotionRuleFormProps) {
  const create = useCreatePromotionRule();
  const toast = useToast();
  const { data: tenants = [] } = useTenants();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  useEffect(() => {
    onLoadingChange?.(create.isPending ?? false);
  }, [create.isPending, onLoadingChange]);

  const nowIsoLocal = useMemo(() => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}`;
  }, []);

  useEffect(() => {
    if (!form.getValues("startDate")) form.setValue("startDate", nowIsoLocal);
    if (!form.getValues("endDate")) form.setValue("endDate", nowIsoLocal);
  }, [form, nowIsoLocal]);

  const onSubmit = (data: FormData) => {
    let eligibilityCriteria: Record<string, unknown> = {};
    try {
      eligibilityCriteria = data.eligibilityCriteriaJson?.trim()
        ? (JSON.parse(data.eligibilityCriteriaJson) as Record<string, unknown>)
        : {};
    } catch {
      toast.error("Eligibility criteria JSON is invalid.");
      return;
    }

    const startIso = toIsoOrEmpty(data.startDate);
    const endIso = toIsoOrEmpty(data.endDate);
    if (!startIso || !endIso) {
      toast.error("Start/end date is invalid.");
      return;
    }

    create.mutate(
      {
        tenantId: data.tenantId,
        name: data.name,
        eligibilityCriteria,
        rewardAction: { type: data.rewardType, value: data.rewardValue },
        priorityLevel: data.priorityLevel,
        isStackable: data.isStackable,
        startDate: startIso,
        endDate: endIso,
      },
      {
        onSuccess: () => {
          toast.success("Promotion rule created.");
          form.reset(defaultValues);
          onSuccess?.();
        },
        onError: () => toast.error("Failed to create promotion rule."),
      }
    );
  };

  return (
    <form id={formId} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Tenant</Label>
          <Controller
            control={form.control}
            name="tenantId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
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
          <Label>Priority</Label>
          <Input type="number" {...form.register("priorityLevel", { valueAsNumber: true })} />
        </div>
      </div>

      <div className="grid gap-2">
        <Label>Name</Label>
        <Input {...form.register("name")} placeholder="10% Off Electronics" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Reward type</Label>
          <Input {...form.register("rewardType")} placeholder="PERCENTAGE_DISCOUNT" />
        </div>
        <div className="grid gap-2">
          <Label>Reward value</Label>
          <Input type="number" step="0.01" {...form.register("rewardValue", { valueAsNumber: true })} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Controller
          control={form.control}
          name="isStackable"
          render={({ field }) => (
            <input
              id="isStackable"
              type="checkbox"
              className="h-4 w-4 rounded border border-input"
              checked={field.value}
              onChange={(e) => field.onChange(e.target.checked)}
            />
          )}
        />
        <Label htmlFor="isStackable" className="font-normal cursor-pointer">
          Stackable with other promotions
        </Label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Start date</Label>
          <Input type="datetime-local" {...form.register("startDate")} />
        </div>
        <div className="grid gap-2">
          <Label>End date</Label>
          <Input type="datetime-local" {...form.register("endDate")} />
        </div>
      </div>

      <div className="grid gap-2">
        <Label>Eligibility criteria (JSON)</Label>
        <Input {...form.register("eligibilityCriteriaJson")} placeholder='{"category":"Electronics"}' />
      </div>

      {!formId && (
        <Button type="submit" disabled={create.isPending}>
          {create.isPending ? "Creating..." : "Create Promotion Rule"}
        </Button>
      )}
    </form>
  );
}

