"use client";

import { Controller, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { PAYMENT_METHOD_KINDS } from "@/core/domain/entities/PaymentMethod";
import { useChartOfAccounts } from "@/presentation/hooks/useChartOfAccounts";
import { getPaginatedItems } from "@/presentation/hooks/pagination";
import { PAYMENT_METHOD_KIND_LABELS } from "./payment-method-kinds";

const NO_ACCOUNT = "__none__";

export const paymentMethodFieldsSchema = z.object({
  name: z.string().trim().min(1, "Give it a name, e.g. Cash or KBZPay"),
  kind: z.enum(PAYMENT_METHOD_KINDS),
  glAccountId: z.string(),
  isActive: z.boolean(),
});

export type PaymentMethodFieldValues = z.infer<typeof paymentMethodFieldsSchema>;

export function PaymentMethodFields({
  control,
  register,
  errors,
  kind,
}: {
  control: Control<PaymentMethodFieldValues>;
  register: UseFormRegister<PaymentMethodFieldValues>;
  errors: FieldErrors<PaymentMethodFieldValues>;
  kind: PaymentMethodFieldValues["kind"];
}) {
  const { data: accountsData, isError: accountsUnavailable } = useChartOfAccounts({
    page: 1,
    limit: 500,
  });
  const accounts = getPaginatedItems(accountsData);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="pm-name">Name</Label>
          <Input id="pm-name" {...register("name")} placeholder="Cash, KBZPay, Visa…" />
          {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="pm-kind">Type</Label>
          <Controller
            control={control}
            name="kind"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="pm-kind">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHOD_KINDS.map((k) => (
                    <SelectItem key={k} value={k}>
                      {PAYMENT_METHOD_KIND_LABELS[k].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <p className="text-xs text-muted">{PAYMENT_METHOD_KIND_LABELS[kind].hint}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="pm-status">Status</Label>
          <Controller
            control={control}
            name="isActive"
            render={({ field }) => (
              <Select
                value={field.value ? "true" : "false"}
                onValueChange={(v) => field.onChange(v === "true")}
              >
                <SelectTrigger id="pm-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active: can be used</SelectItem>
                  <SelectItem value="false">Inactive: hidden at checkout</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
        {!accountsUnavailable && accounts.length > 0 ? (
          <div className="grid gap-2">
            <Label htmlFor="pm-gl">Accounting account (optional)</Label>
            <Controller
              control={control}
              name="glAccountId"
              render={({ field }) => (
                <Select
                  value={field.value || NO_ACCOUNT}
                  onValueChange={(v) => field.onChange(v === NO_ACCOUNT ? "" : v)}
                >
                  <SelectTrigger id="pm-gl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_ACCOUNT}>None</SelectItem>
                    {accounts.map((a) => (
                      <SelectItem key={String(a.id)} value={String(a.id)}>
                        {a.accountCode} · {a.accountName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <p className="text-xs text-muted">For accountants. Leave as None if you don&apos;t use Finance.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
