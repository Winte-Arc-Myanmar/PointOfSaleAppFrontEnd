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
import type { SpaRoom, SpaRoomInput } from "@/core/domain/entities/Spa";

type Errors = Partial<Record<keyof SpaRoomInput, string>>;

const FieldError = ({ message }: { message?: string }) =>
  message ? <p className="text-sm text-red-600">{message}</p> : null;

export function SpaRoomForm({
  formId,
  room,
  onSubmit,
}: {
  formId: string;
  room?: SpaRoom;
  onSubmit: (data: SpaRoomInput) => void;
}) {
  const { tenantId } = usePermissions();
  const { data: locationsData } = useLocations({ page: 1, limit: 200 });
  const locations = getPaginatedItems(locationsData).filter(
    (l) => !l.deletedAt && (!tenantId || String(l.tenantId) === tenantId),
  );
  const [locationId, setLocationId] = useState(room?.locationId ?? "");
  const [roomNumber, setRoomNumber] = useState(room?.roomNumber ?? "");
  const [name, setName] = useState(room?.name ?? "");
  const [capacity, setCapacity] = useState(String(room?.capacity ?? 1));
  const [outOfService, setOutOfService] = useState(room?.status === "OUT_OF_SERVICE");
  const [errors, setErrors] = useState<Errors>({});

  const effectiveLocationId = locationId || (locations.length === 1 ? String(locations[0].id) : "");
  const statusEditable = !room || room.status === "AVAILABLE" || room.status === "OUT_OF_SERVICE";

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const e: Errors = {};
    if (!effectiveLocationId) e.locationId = "Choose the outlet.";
    if (!roomNumber.trim()) e.roomNumber = "Give the room a number, e.g. S1.";
    if (!(Number(capacity) >= 1)) e.capacity = "How many guests fit? At least 1.";
    setErrors(e);
    if (Object.keys(e).length) return;
    onSubmit({
      locationId: effectiveLocationId,
      roomNumber: roomNumber.trim(),
      name: name.trim() || null,
      capacity: Math.round(Number(capacity)),
      ...(room && statusEditable ? { status: outOfService ? "OUT_OF_SERVICE" : "AVAILABLE" } : {}),
    });
  };

  return (
    <form id={formId} onSubmit={submit} className="space-y-4" noValidate>
      <p className="text-sm text-muted">
        A SPA room is only where the treatment happens. Guests pay for the service package they
        choose, not for the room.
      </p>
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="grid gap-1">
          <Label htmlFor="spa-number">Room number</Label>
          <Input id="spa-number" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} placeholder="e.g. S1" />
          <FieldError message={errors.roomNumber} />
        </div>
        <div className="grid gap-1">
          <Label htmlFor="spa-name">Name (optional)</Label>
          <Input id="spa-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Couple room" />
        </div>
        <div className="grid gap-1">
          <Label htmlFor="spa-capacity">How many guests</Label>
          <Input id="spa-capacity" type="number" min={1} value={capacity} onChange={(e) => setCapacity(e.target.value)} />
          <FieldError message={errors.capacity} />
        </div>
      </div>
      {room && statusEditable ? (
        <label className="flex items-center justify-between gap-4 rounded-xl border border-border px-4 py-3">
          <span>
            <span className="block text-sm font-medium">Out of service</span>
            <span className="block text-xs text-muted">Turn on while the room is being repaired. It can&apos;t be started.</span>
          </span>
          <input type="checkbox" className="size-5" checked={outOfService} onChange={(e) => setOutOfService(e.target.checked)} />
        </label>
      ) : null}
    </form>
  );
}
