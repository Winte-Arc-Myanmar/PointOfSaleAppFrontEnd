"use client";

import { useState } from "react";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import type { Hostess, HostessInput } from "@/core/domain/entities/Hostess";

export function HostessForm({
  formId,
  hostess,
  onSubmit,
}: {
  formId: string;
  hostess?: Hostess;
  onSubmit: (data: HostessInput) => void;
}) {
  const [name, setName] = useState(hostess?.name ?? "");
  const [nickname, setNickname] = useState(hostess?.nickname ?? "");
  const [phoneNumber, setPhoneNumber] = useState(hostess?.phoneNumber ?? "");
  const [isActive, setIsActive] = useState(hostess?.isActive ?? true);
  const [commission, setCommission] = useState(
    hostess?.menuCommissionBps == null ? "" : String(hostess.menuCommissionBps / 100),
  );
  const [error, setError] = useState<string | null>(null);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      setError("Enter her name.");
      return;
    }
    const percent = Number(commission);
    if (commission.trim() && (!Number.isFinite(percent) || percent < 0 || percent > 100)) {
      setError("Commission is a percent from 0 to 100, or blank for the shop default.");
      return;
    }
    setError(null);
    onSubmit({
      name: name.trim(),
      nickname: nickname.trim() || undefined,
      phoneNumber: phoneNumber.trim() || undefined,
      isActive,
      menuCommissionBps: commission.trim() ? Math.round(percent * 100) : null,
    });
  };

  return (
    <form id={formId} onSubmit={submit} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="grid gap-1">
          <Label htmlFor="hostess-name">Name</Label>
          <Input id="hostess-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ma Hnin" />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </div>
        <div className="grid gap-1">
          <Label htmlFor="hostess-nickname">Nickname</Label>
          <Input
            id="hostess-nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="What guests call her, e.g. Snow"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="grid gap-1">
          <Label htmlFor="hostess-phone">Phone</Label>
          <Input id="hostess-phone" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="09-..." />
        </div>
        <div className="grid gap-1">
          <Label htmlFor="hostess-commission">Menu commission %</Label>
          <Input
            id="hostess-commission"
            type="number"
            inputMode="decimal"
            min={0}
            max={100}
            step={0.5}
            value={commission}
            onChange={(e) => setCommission(e.target.value)}
            placeholder="Blank = shop default (Venue setup)"
          />
        </div>
      </div>
      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border border-input"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
        />
        Working now (can be picked at the till)
      </label>
    </form>
  );
}
