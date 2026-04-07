"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { usePromotionRule, useUpdatePromotionRule } from "@/presentation/hooks/usePromotionRules";
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
import { AppLoader } from "@/presentation/components/loader";

const schema = z.object({
  tenantId: z.string().min(1, "Tenant is required"),
  name: z.string().min(1, "Name is required"),
  eligibilityCriteriaJson: z.string(),
  rewardType: z.string().min(1),
  rewardValue: z.number(),
  priorityLevel: z.number(),
  isStackable: z.boolean(),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
});

type FormData = z.infer<typeof schema>;

const REDIRECT_DELAY_MS = 1500;

function toLocalInputValue(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function toIsoOrEmpty(dtLocal: string): string {
  if (!dtLocal.trim()) return "";
  const d = new Date(dtLocal);
  return Number.isFinite(d.getTime()) ? d.toISOString() : "";
}

export function EditPromotionRuleForm({ ruleId }: { ruleId: string }) {
  const router = useRouter();
  const toast = useToast();
  const update = useUpdatePromotionRule();
  const { data: rule, isLoading, error } = usePromotionRule(ruleId);
  const { data: tenants = [] } = useTenants();
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      tenantId: "",
      name: "",
      eligibilityCriteriaJson: "{}",
      rewardType: "PERCENTAGE_DISCOUNT",
      rewardValue: 0,
      priorityLevel: 0,
      isStackable: false,
      startDate: "",
      endDate: "",
    },
  });

  useEffect(() => {
    if (rule) {
      form.reset({
        tenantId: rule.tenantId,
        name: rule.name,
        eligibilityCriteriaJson: JSON.stringify(rule.eligibilityCriteria ?? {}, null, 2),
        rewardType: rule.rewardAction?.type ?? "PERCENTAGE_DISCOUNT",
        rewardValue: Number(rule.rewardAction?.value ?? 0),
        priorityLevel: Number(rule.priorityLevel ?? 0),
        isStackable: !!rule.isStackable,
        startDate: toLocalInputValue(rule.startDate),
        endDate: toLocalInputValue(rule.endDate),
      });
    }
  }, [rule, form]);

  const onSubmit = (data: FormData) => {
    setShowSuccess(false);
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

    update.mutate(
      {
        id: ruleId,
        data: {
          tenantId: data.tenantId,
          name: data.name,
          eligibilityCriteria,
          rewardAction: { type: data.rewardType, value: data.rewardValue },
          priorityLevel: data.priorityLevel,
          isStackable: data.isStackable,
          startDate: startIso,
          endDate: endIso,
        },
      },
      {
        onSuccess: () => {
          toast.success("Promotion rule updated.");
          setShowSuccess(true);
          setTimeout(() => router.push(`/promotion-rules/${ruleId}`), REDIRECT_DELAY_MS);
        },
        onError: () => toast.error("Failed to update promotion rule."),
      }
    );
  };

  if (isLoading) return <AppLoader fullScreen={false} size="sm" message="Loading..." />;
  if (error || !rule) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Promotion rule not found.</p>
        <Link href="/promotion-rules">
          <Button variant="outline">Back to Promotion Rules</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/promotion-rules/${ruleId}`}>
          <Button variant="ghost" size="icon" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="panel-header text-xl tracking-tight">Edit promotion rule</h1>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
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
          </div>
          <div className="grid gap-2">
            <Label>Priority</Label>
            <Input type="number" {...form.register("priorityLevel", { valueAsNumber: true })} />
          </div>
        </div>

        <div className="grid gap-2">
          <Label>Name</Label>
          <Input {...form.register("name")} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Reward type</Label>
            <Input {...form.register("rewardType")} />
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
          <Input {...form.register("eligibilityCriteriaJson")} />
        </div>

        {showSuccess && (
          <p className="text-sm text-green-600 font-medium">
            Promotion rule updated successfully. Redirecting...
          </p>
        )}
        {update.isError && <p className="text-sm text-red-600">Failed to update promotion rule.</p>}

        <div className="flex gap-2">
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? "Saving..." : "Save changes"}
          </Button>
          <Link href={`/promotion-rules/${ruleId}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}

