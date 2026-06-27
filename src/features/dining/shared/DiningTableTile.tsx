"use client";

import type { DiningTable } from "@/core/domain/entities/DiningTable";
import { Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { getStatusConfig } from "./dining-ui";

interface DiningTableTileProps {
  table: DiningTable;
  onClick?: () => void;
  compact?: boolean;
  className?: string;
}

export function DiningTableTile({ table, onClick, compact, className }: DiningTableTileProps) {
  const cfg = getStatusConfig(table.status);
  const isCircle = table.shape === "CIRCLE";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center justify-center border-2 shadow-sm transition-all",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-mint focus-visible:ring-offset-2",
        cfg.tileClass,
        isCircle ? "rounded-full aspect-square" : "rounded-xl",
        compact ? "min-h-[72px] min-w-[72px] p-2" : "min-h-[96px] min-w-[96px] p-3",
        className
      )}
    >
      <span className={cn("font-bold leading-none", compact ? "text-base" : "text-lg")}>
        {table.tableNumber}
      </span>
      <span className="mt-1 inline-flex items-center gap-1 text-[11px] opacity-80">
        <Users className="size-3" />
        {table.maxSeats}
      </span>
      <span className="mt-1 text-[10px] font-medium uppercase tracking-wide opacity-70">
        {cfg.shortLabel}
      </span>
    </button>
  );
}
