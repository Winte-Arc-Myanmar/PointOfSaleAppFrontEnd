"use client";

import { useState } from "react";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { useLocations } from "@/presentation/hooks/useLocations";
import { usePermissions } from "@/presentation/hooks/usePermissions";
import { getPaginatedItems } from "@/presentation/hooks/pagination";
import type { KtvRoom, KtvRoomInput, RoomRoundingMode } from "@/core/domain/entities/KtvRoom";
import { cn } from "@/lib/utils";

const ROUNDING: { value: RoomRoundingMode; label: string; hint: string }[] = [
  { value: "UP", label: "Round up", hint: "A started block is charged in full." },
  { value: "NEAREST", label: "Round to nearest", hint: "Charged if more than half a block is used." },
  { value: "DOWN", label: "Round down", hint: "Only full blocks are charged." },
];

type Errors = Partial<Record<keyof KtvRoomInput, string>>;

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-sm text-red-600">{message}</p> : null;
}

function NumberField({
  id,
  label,
  hint,
  value,
  onChange,
  error,
  suffix,
}: {
  id: string;
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  suffix?: string;
}) {
  return (
    <div className="grid gap-1">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          id={id}
          type="number"
          inputMode="numeric"
          min={0}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {suffix ? <span className="shrink-0 text-sm text-muted">{suffix}</span> : null}
      </div>
      {hint ? <p className="text-xs text-muted">{hint}</p> : null}
      <FieldError message={error} />
    </div>
  );
}

export function KtvRoomForm({
  formId,
  room,
  onSubmit,
}: {
  formId: string;
  room?: KtvRoom;
  onSubmit: (data: KtvRoomInput) => void;
}) {
  const { tenantId } = usePermissions();
  const { data: locationsData } = useLocations({ page: 1, limit: 200 });
  const locations = getPaginatedItems(locationsData).filter(
    (l) => !l.deletedAt && (!tenantId || String(l.tenantId) === tenantId),
  );

  const [locationId, setLocationId] = useState(room?.locationId ?? "");
  const [roomNumber, setRoomNumber] = useState(room?.roomNumber ?? "");
  const [name, setName] = useState(room?.name ?? "");
  const [capacity, setCapacity] = useState(room ? String(room.capacity) : "");
  const [price, setPrice] = useState(room ? String(room.pricePerHour) : "");
  const [minimumMinutes, setMinimumMinutes] = useState(String(room?.minimumMinutes ?? 60));
  const [incrementMinutes, setIncrementMinutes] = useState(String(room?.incrementMinutes ?? 30));
  const [graceMinutes, setGraceMinutes] = useState(String(room?.graceMinutes ?? 5));
  const [roundingMode, setRoundingMode] = useState<RoomRoundingMode>(room?.roundingMode ?? "UP");
  const [outOfService, setOutOfService] = useState(room?.status === "OUT_OF_SERVICE");
  const [errors, setErrors] = useState<Errors>({});

  const effectiveLocationId = locationId || (locations.length === 1 ? String(locations[0].id) : "");
  const statusEditable = !room || room.status === "AVAILABLE" || room.status === "OUT_OF_SERVICE";

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const e: Errors = {};
    const num = (v: string) => (v.trim() === "" ? NaN : Number(v));
    if (!effectiveLocationId) e.locationId = "Choose the outlet.";
    if (!roomNumber.trim()) e.roomNumber = "Give the room a number, e.g. A1.";
    if (!(num(capacity) >= 1)) e.capacity = "How many people fit? At least 1.";
    if (!(num(price) >= 0)) e.pricePerHour = "Enter the price for one hour.";
    if (!(num(minimumMinutes) >= 0)) e.minimumMinutes = "0 or more minutes.";
    if (!(num(incrementMinutes) >= 1)) e.incrementMinutes = "At least 1 minute.";
    if (!(num(graceMinutes) >= 0)) e.graceMinutes = "0 or more minutes.";
    setErrors(e);
    if (Object.keys(e).length) return;
    onSubmit({
      locationId: effectiveLocationId,
      roomNumber: roomNumber.trim(),
      name: name.trim() || null,
      capacity: Math.round(num(capacity)),
      pricePerHour: num(price),
      minimumMinutes: Math.round(num(minimumMinutes)),
      incrementMinutes: Math.round(num(incrementMinutes)),
      graceMinutes: Math.round(num(graceMinutes)),
      roundingMode,
      ...(statusEditable && room ? { status: outOfService ? "OUT_OF_SERVICE" : "AVAILABLE" } : {}),
    });
  };

  return (
    <form id={formId} onSubmit={submit} className="space-y-4" noValidate>
      {locations.length > 1 || !effectiveLocationId ? (
        <div className="grid gap-1">
          <Label>Outlet</Label>
          <Select value={effectiveLocationId} onValueChange={(v) => v && setLocationId(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Choose the outlet" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((l) => (
                <SelectItem key={String(l.id)} value={String(l.id)}>
                  {l.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError message={errors.locationId} />
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="grid gap-1">
          <Label htmlFor="ktv-number">Room number</Label>
          <Input id="ktv-number" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} placeholder="e.g. A1" />
          <FieldError message={errors.roomNumber} />
        </div>
        <div className="grid gap-1">
          <Label htmlFor="ktv-name">Name (optional)</Label>
          <Input id="ktv-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. VIP Grand" />
        </div>
        <NumberField
          id="ktv-capacity"
          label="How many people"
          value={capacity}
          onChange={setCapacity}
          error={errors.capacity}
          suffix="people"
        />
        <NumberField
          id="ktv-price"
          label="Price per hour"
          hint="Peak-hour prices can be added later."
          value={price}
          onChange={setPrice}
          error={errors.pricePerHour}
        />
      </div>

      {room && statusEditable ? (
        <label className="flex items-center justify-between gap-4 rounded-xl border border-border px-4 py-3">
          <span>
            <span className="block text-sm font-medium">Out of service</span>
            <span className="block text-xs text-muted">Turn on while the room is being repaired. It can&apos;t be started.</span>
          </span>
          <input
            type="checkbox"
            className="size-5"
            checked={outOfService}
            onChange={(e) => setOutOfService(e.target.checked)}
          />
        </label>
      ) : null}

      <details className="rounded-xl border border-border px-4 py-3 text-sm">
        <summary className="cursor-pointer font-medium">Advanced: how time is charged</summary>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <NumberField
            id="ktv-min"
            label="Minimum charge"
            hint="Shortest time a guest pays for."
            value={minimumMinutes}
            onChange={setMinimumMinutes}
            error={errors.minimumMinutes}
            suffix="min"
          />
          <NumberField
            id="ktv-inc"
            label="Then charged every"
            hint="Time after the minimum, in blocks."
            value={incrementMinutes}
            onChange={setIncrementMinutes}
            error={errors.incrementMinutes}
            suffix="min"
          />
          <NumberField
            id="ktv-grace"
            label="Free extra minutes"
            hint="Not charged before a new block starts."
            value={graceMinutes}
            onChange={setGraceMinutes}
            error={errors.graceMinutes}
            suffix="min"
          />
        </div>
        <div className="mt-4 grid gap-2">
          <Label>Rounding</Label>
          <div role="radiogroup" className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {ROUNDING.map((r) => (
              <button
                key={r.value}
                type="button"
                role="radio"
                aria-checked={roundingMode === r.value}
                onClick={() => setRoundingMode(r.value)}
                className={cn(
                  "rounded-lg border p-3 text-left",
                  roundingMode === r.value ? "border-mint bg-mint/15" : "border-border hover:border-mint/60",
                )}
              >
                <span className="block text-sm font-medium">{r.label}</span>
                <span className="block text-xs text-muted">{r.hint}</span>
              </button>
            ))}
          </div>
        </div>
      </details>
    </form>
  );
}
