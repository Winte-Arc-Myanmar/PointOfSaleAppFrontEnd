"use client";

import { Controller, type UseFormReturn } from "react-hook-form";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";

export const CARD_TIER_PRELOAD_FUNDING = ["PURCHASED"] as const;

export type CardTierFormValues = {
  name: string;
  rank: number;
  preloadAmount: number;
  preloadFunding: string;
  discountBps: number;
  isPostpaid: boolean;
  validityDays: number;
  isActive: boolean;
};

export function CardTierFormFields({
  form,
}: {
  form: UseFormReturn<CardTierFormValues>;
}) {
  const discountBps = form.watch("discountBps");
  const discountPercent = Number.isFinite(discountBps)
    ? (discountBps / 100).toFixed(2)
    : "0.00";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...form.register("name")} placeholder="Silver" />
          {form.formState.errors.name && (
            <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="rank">Rank</Label>
          <Input
            id="rank"
            type="number"
            min={0}
            step={1}
            {...form.register("rank", { valueAsNumber: true })}
          />
          {form.formState.errors.rank && (
            <p className="text-sm text-red-600">{form.formState.errors.rank.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="preloadAmount">Preload amount</Label>
          <Input
            id="preloadAmount"
            type="number"
            min={0}
            step="0.0001"
            {...form.register("preloadAmount", { valueAsNumber: true })}
          />
          {form.formState.errors.preloadAmount && (
            <p className="text-sm text-red-600">
              {form.formState.errors.preloadAmount.message}
            </p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="preloadFunding">Preload funding</Label>
          <Controller
            control={form.control}
            name="preloadFunding"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="preloadFunding">
                  <SelectValue placeholder="Select funding" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from(
                    new Set([
                      ...CARD_TIER_PRELOAD_FUNDING,
                      ...(field.value ? [field.value] : []),
                    ]),
                  ).map((value) => (
                    <SelectItem key={value} value={value}>
                      {value}
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
          <Label htmlFor="discountBps">Discount (basis points)</Label>
          <Input
            id="discountBps"
            type="number"
            min={0}
            step={1}
            {...form.register("discountBps", { valueAsNumber: true })}
          />
          <p className="text-xs text-muted">500 bps = 5.00% · current {discountPercent}%</p>
          {form.formState.errors.discountBps && (
            <p className="text-sm text-red-600">
              {form.formState.errors.discountBps.message}
            </p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="validityDays">Validity days</Label>
          <Input
            id="validityDays"
            type="number"
            min={0}
            step={1}
            {...form.register("validityDays", { valueAsNumber: true })}
          />
          {form.formState.errors.validityDays && (
            <p className="text-sm text-red-600">
              {form.formState.errors.validityDays.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
          <input
            type="checkbox"
            className="h-4 w-4 accent-emerald-500"
            {...form.register("isPostpaid")}
          />
          <span className="text-sm text-foreground">Postpaid</span>
        </label>
        <label className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
          <input
            type="checkbox"
            className="h-4 w-4 accent-emerald-500"
            {...form.register("isActive")}
          />
          <span className="text-sm text-foreground">Active</span>
        </label>
      </div>
    </div>
  );
}
