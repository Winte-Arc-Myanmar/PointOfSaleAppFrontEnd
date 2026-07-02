"use client";

import type { DiningTableStatus } from "@/core/domain/entities/DiningTable";
import { cn } from "@/lib/utils";
import { STATUS_CONFIG, TABLE_STATUSES } from "./dining-ui";

interface StatusActionBarProps {
  value: DiningTableStatus;
  onChange: (status: DiningTableStatus) => void;
  disabled?: boolean;
}

export function StatusActionBar({ value, onChange, disabled }: StatusActionBarProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {TABLE_STATUSES.map((status) => {
        const cfg = STATUS_CONFIG[status];
        const active = value === status;
        return (
          <button
            key={status}
            type="button"
            disabled={disabled}
            onClick={() => onChange(status)}
            className={cn(
              "rounded-xl border-2 px-4 py-4 text-left transition-all disabled:opacity-50",
              cfg.tileClass,
              active && "ring-2 ring-offset-2 ring-current scale-[1.02]"
            )}
          >
            <span className={cn("inline-block size-2.5 rounded-full mb-2", cfg.dotClass)} />
            <span className="block text-sm font-semibold">{cfg.label}</span>
            <span className="block text-xs opacity-70 mt-0.5">
              {status === "AVAILABLE" && "Ready for guests"}
              {status === "OCCUPIED" && "Guests seated"}
              {status === "DIRTY" && "Needs bussing"}
              {status === "RESERVED" && "Held for booking"}
            </span>
          </button>
        );
      })}
    </div>
  );
}
