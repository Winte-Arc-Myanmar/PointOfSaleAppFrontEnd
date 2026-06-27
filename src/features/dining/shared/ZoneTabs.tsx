"use client";

import type { DiningZone } from "@/core/domain/entities/DiningZone";
import { cn } from "@/lib/utils";

interface ZoneTabsProps {
  zones: DiningZone[];
  value: string | null;
  onChange: (zoneId: string) => void;
  className?: string;
}

export function ZoneTabs({ zones, value, onChange, className }: ZoneTabsProps) {
  if (zones.length === 0) {
    return (
      <p className="text-sm text-muted">
        No dining zones yet. Create a zone first to manage its floor plan.
      </p>
    );
  }

  return (
    <div className={cn("flex gap-2 overflow-x-auto pb-1 hide-scrollbar", className)}>
      {zones.map((zone) => {
        const active = value === String(zone.id);
        return (
          <button
            key={zone.id}
            type="button"
            onClick={() => onChange(String(zone.id))}
            className={cn(
              "shrink-0 rounded-xl border px-4 py-2.5 text-left transition-colors min-w-[120px]",
              active
                ? "border-mint bg-mint/10 text-foreground shadow-sm"
                : "border-border bg-background text-muted hover:border-mint/40 hover:text-foreground"
            )}
          >
            <span className="block text-sm font-semibold truncate">{zone.name}</span>
            <span className="block text-[11px] text-muted mt-0.5">Floor {zone.sortOrder + 1}</span>
          </button>
        );
      })}
    </div>
  );
}
