"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { useCreateLocation, useLocations } from "@/presentation/hooks/useLocations";
import { getPaginatedItems } from "@/presentation/hooks/pagination";
import { useToast } from "@/presentation/providers/ToastProvider";
import { getHttpErrorMessage } from "@/lib/http-error";
import type { Location } from "@/core/domain/entities/Location";

const NEW_OUTLET = "__new_outlet__";

/** An outlet is a location of type store; warehouses, bins and shelves are not. */
export const isOutlet = (location: Location) => location.type?.toLowerCase() === "store";

/**
 * The tenant's outlets, picked by name, with "+ New outlet" at the bottom that
 * adds one by name without leaving the form. Warehouses and shelves are left out,
 * unless one is already chosen or the tenant has no outlet yet.
 */
export function OutletSelect({
  tenantId,
  value,
  onChange,
  id,
  disabled,
}: {
  tenantId?: string | null;
  value: string;
  onChange: (locationId: string) => void;
  id?: string;
  disabled?: boolean;
}) {
  const toast = useToast();
  const { data } = useLocations({ page: 1, limit: 200 });
  const create = useCreateLocation();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");

  const all = getPaginatedItems(data).filter(
    (l) => !l.deletedAt && (!tenantId || String(l.tenantId) === tenantId),
  );
  const outlets = all.some(isOutlet)
    ? all.filter((l) => isOutlet(l) || String(l.id) === value)
    : all;

  const add = () => {
    const trimmed = name.trim();
    if (!trimmed || !tenantId) return;
    create.mutate(
      { tenantId, name: trimmed, type: "store", parentLocationId: null },
      {
        onSuccess: (created) => {
          setAdding(false);
          setName("");
          if (created?.id) onChange(String(created.id));
          toast.success(`Outlet “${trimmed}” added.`);
        },
        onError: (error) => toast.error(getHttpErrorMessage(error, "Could not add the outlet.")),
      },
    );
  };

  if (adding) {
    return (
      <div className="flex gap-2">
        <Input
          autoFocus
          value={name}
          placeholder="New outlet name, e.g. Spa Floor 2"
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              add();
            }
            if (event.key === "Escape") setAdding(false);
          }}
        />
        <Button type="button" onClick={add} disabled={!name.trim() || create.isPending}>
          {create.isPending ? "Adding..." : "Add"}
        </Button>
        <Button type="button" variant="outline" onClick={() => setAdding(false)}>
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <Select
      value={value || undefined}
      onValueChange={(next) => {
        if (next === NEW_OUTLET) setAdding(true);
        else if (next) onChange(String(next));
      }}
      disabled={disabled}
    >
      <SelectTrigger id={id}>
        <SelectValue placeholder={outlets.length ? "Choose the outlet" : "No outlet yet"} />
      </SelectTrigger>
      <SelectContent>
        {outlets.map((l) => (
          <SelectItem key={String(l.id)} value={String(l.id)}>
            {l.name}
          </SelectItem>
        ))}
        {tenantId ? (
          <>
            {outlets.length ? <SelectSeparator /> : null}
            <SelectItem value={NEW_OUTLET}>
              <span className="flex items-center gap-1.5 text-mint">
                <Plus className="size-3.5" /> New outlet
              </span>
            </SelectItem>
          </>
        ) : null}
      </SelectContent>
    </Select>
  );
}
