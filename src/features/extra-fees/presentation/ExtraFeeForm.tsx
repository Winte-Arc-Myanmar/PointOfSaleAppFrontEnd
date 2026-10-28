"use client";

import { useState } from "react";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import type { ExtraFee, ExtraFeeInput } from "@/core/domain/entities/ExtraFee";

export function ExtraFeeForm({
  formId,
  fee,
  onSubmit,
}: {
  formId: string;
  fee?: ExtraFee;
  onSubmit: (data: ExtraFeeInput) => void;
}) {
  const [name, setName] = useState(fee?.name ?? "");
  const [amount, setAmount] = useState(fee ? String(fee.amount) : "");
  const [isActive, setIsActive] = useState(fee?.isActive ?? true);
  const [error, setError] = useState<string | null>(null);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const value = Number(amount);
    if (!name.trim()) {
      setError("Enter the fee's name.");
      return;
    }
    if (amount.trim() === "" || !Number.isFinite(value) || value < 0) {
      setError("Enter an amount of 0 or more.");
      return;
    }
    setError(null);
    onSubmit({ name: name.trim(), amount: value, isActive });
  };

  return (
    <form id={formId} onSubmit={submit} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="grid gap-1">
          <Label htmlFor="fee-name">Name</Label>
          <Input
            id="fee-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Plastic container"
          />
        </div>
        <div className="grid gap-1">
          <Label htmlFor="fee-amount">Amount</Label>
          <Input
            id="fee-amount"
            type="number"
            min={0}
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 300"
          />
          <p className="text-xs text-muted">The cashier can change it on a bill.</p>
        </div>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border border-input"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
        />
        On (offered at the till)
      </label>
    </form>
  );
}
