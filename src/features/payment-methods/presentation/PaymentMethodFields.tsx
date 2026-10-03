"use client";

import { useState } from "react";
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
import { PAYMENT_METHOD_KINDS, type PaymentMethodKind } from "@/core/domain/entities/PaymentMethod";
import { useChartOfAccounts } from "@/presentation/hooks/useChartOfAccounts";
import { getPaginatedItems } from "@/presentation/hooks/pagination";
import { cn } from "@/lib/utils";
import {
  MAIN_PAYMENT_METHOD_KINDS,
  PAYMENT_METHOD_KIND_LABELS,
  paymentMethodKindLabel,
} from "./payment-method-kinds";

const NO_ACCOUNT = "__none__";

export const paymentMethodFieldsSchema = z.object({
  name: z.string().trim().min(1, "Give it a name, e.g. Cash or KBZPay"),
  kind: z.enum(PAYMENT_METHOD_KINDS),
  glAccountId: z.string(),
  isActive: z.boolean(),
});

export type PaymentMethodFieldValues = z.infer<typeof paymentMethodFieldsSchema>;

function KindTile({
  kind,
  selected,
  onSelect,
}: {
  kind: PaymentMethodKind;
  selected: boolean;
  onSelect: () => void;
}) {
  const { label, icon: Icon } = PAYMENT_METHOD_KIND_LABELS[kind];
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-xs font-medium transition-colors",
        selected
          ? "border-mint bg-mint/15 text-foreground"
          : "border-border text-muted hover:border-mint/60 hover:text-foreground",
      )}
    >
      <Icon className="size-5" />
      {label}
    </button>
  );
}

export function PaymentMethodFields({
  control,
  register,
  errors,
  kind,
}: {
  control: Control<PaymentMethodFieldValues>;
  register: UseFormRegister<PaymentMethodFieldValues>;
  errors: FieldErrors<PaymentMethodFieldValues>;
  kind: PaymentMethodFieldValues["kind"] | undefined;
}) {
  const [showAllKinds, setShowAllKinds] = useState(
    Boolean(kind && !MAIN_PAYMENT_METHOD_KINDS.includes(kind)),
  );
  const { data: accountsData, isError: accountsUnavailable } = useChartOfAccounts({
    page: 1,
    limit: 500,
  });
  const accounts = getPaginatedItems(accountsData);
  const kinds = showAllKinds ? PAYMENT_METHOD_KINDS : MAIN_PAYMENT_METHOD_KINDS;

  return (
    <div className="space-y-5">
      <div className="grid gap-2">
        <Label htmlFor="pm-name">Name</Label>
        <Input id="pm-name" {...register("name")} placeholder="e.g. Cash, KBZPay, Visa" />
        {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
      </div>

      <div className="grid gap-2">
        <Label>Type</Label>
        <Controller
          control={control}
          name="kind"
          render={({ field }) => (
            <div role="radiogroup" className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {kinds.map((k) => (
                <KindTile key={k} kind={k} selected={field.value === k} onSelect={() => field.onChange(k)} />
              ))}
            </div>
          )}
        />
        <p className="text-xs text-muted">{paymentMethodKindLabel(kind).hint}</p>
        {!showAllKinds ? (
          <button
            type="button"
            onClick={() => setShowAllKinds(true)}
            className="justify-self-start text-xs text-mint underline"
          >
            More types: customer credit, guest card, voucher
          </button>
        ) : null}
      </div>

      <Controller
        control={control}
        name="isActive"
        render={({ field }) => (
          <div className="flex items-center justify-between gap-4 rounded-xl border border-border px-4 py-3">
            <div>
              <p className="text-sm font-medium">Available at checkout</p>
              <p className="text-xs text-muted">Turn off to hide it without deleting it.</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={field.value}
              aria-label="Available at checkout"
              onClick={() => field.onChange(!field.value)}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors",
                field.value ? "bg-emerald-500" : "bg-muted-foreground/30",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform",
                  field.value ? "translate-x-5" : "translate-x-0.5",
                )}
              />
            </button>
          </div>
        )}
      />

      {!accountsUnavailable && accounts.length > 0 ? (
        <details className="rounded-xl border border-border px-4 py-3 text-sm">
          <summary className="cursor-pointer font-medium">For accountants (optional)</summary>
          <div className="mt-3 grid gap-2">
            <Label htmlFor="pm-gl">Accounting account</Label>
            <Controller
              control={control}
              name="glAccountId"
              render={({ field }) => (
                <Select
                  value={field.value || NO_ACCOUNT}
                  onValueChange={(v) => {
                    if (v) field.onChange(v === NO_ACCOUNT ? "" : v);
                  }}
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
            <p className="text-xs text-muted">Where this money is booked. Leave as None if you don&apos;t use Finance.</p>
          </div>
        </details>
      ) : null}
    </div>
  );
}
