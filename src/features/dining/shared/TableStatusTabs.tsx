"use client";

import type { DiningTableStatus } from "@/core/domain/entities/DiningTable";
import { cn } from "@/lib/utils";
import { STATUS_CONFIG, TABLE_STATUSES } from "./dining-ui";

interface TableStatusTabsProps {
  value: DiningTableStatus | "ALL";
  onChange: (value: DiningTableStatus | "ALL") => void;
  counts?: Partial<Record<DiningTableStatus, number>>;
  className?: string;
}

export function TableStatusTabs({ value, onChange, counts, className }: TableStatusTabsProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <button
        type="button"
        data-active={value === "ALL"}
        onClick={() => onChange("ALL")}
        className={cn(
          "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
          "border-border bg-background text-foreground hover:bg-muted",
          value === "ALL" && "bg-foreground text-background border-foreground"
        )}
      >
        All
        {counts && (
          <span className="opacity-80">
            {TABLE_STATUSES.reduce((sum, s) => sum + (counts[s] ?? 0), 0)}
          </span>
        )}
      </button>
      {TABLE_STATUSES.map((status) => {
        const cfg = STATUS_CONFIG[status];
        const active = value === status;
        return (
          <button
            key={status}
            type="button"
            data-active={active}
            onClick={() => onChange(status)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              cfg.chipClass,
              active && "ring-2 ring-offset-1 ring-current"
            )}
          >
            <span className={cn("size-2 rounded-full", cfg.dotClass)} />
            {cfg.label}
            {counts && <span className="opacity-80">{counts[status] ?? 0}</span>}
          </button>
        );
      })}
    </div>
  );
}
