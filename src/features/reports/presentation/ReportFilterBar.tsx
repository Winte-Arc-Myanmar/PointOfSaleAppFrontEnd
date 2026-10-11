"use client";

import type { ReactNode } from "react";
import { Store } from "lucide-react";
import { cn } from "@/lib/utils";
import { DatePicker } from "@/presentation/components/ui/date-picker";
import { InfoTip } from "@/presentation/components/ui/info-tip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { startOfMonth, toDateInputValue } from "./report-utils";

export const ALL_OUTLETS = "__all__";

const daysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return toDateInputValue(date);
};

type Preset = { label: string; from: () => string; to: () => string };

const RANGE_PRESETS: Preset[] = [
  { label: "Today", from: () => daysAgo(0), to: () => daysAgo(0) },
  { label: "Last 7 days", from: () => daysAgo(6), to: () => daysAgo(0) },
  { label: "This month", from: () => startOfMonth(new Date()), to: () => daysAgo(0) },
];

const DAY_PRESETS = [
  { label: "Today", date: () => daysAgo(0) },
  { label: "Yesterday", date: () => daysAgo(1) },
];

function PresetButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "h-8 rounded-md px-2.5 text-xs font-medium whitespace-nowrap transition-colors",
        active ? "bg-mint/15 text-mint" : "text-muted hover:bg-mint/10 hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

type ReportFilterBarProps = {
  locations: { id: string | number; name: string }[];
  locationId: string;
  onLocationChange: (id: string) => void;
  /** Day tabs (daily, by hour, Z-report) pick one business date; the rest a range. */
  mode: "range" | "day";
  from: string;
  to: string;
  onRangeChange: (from: string, to: string) => void;
  date: string;
  onDateChange: (date: string) => void;
  actions?: ReactNode;
  className?: string;
};

/** One slim row of outlet, dates and quick ranges that stays on screen while the page scrolls. */
export function ReportFilterBar({
  locations,
  locationId,
  onLocationChange,
  mode,
  from,
  to,
  onRangeChange,
  date,
  onDateChange,
  actions,
  className,
}: ReportFilterBarProps) {
  return (
    <div
      className={cn(
        "sticky top-0 z-20 flex flex-wrap items-center gap-2 rounded-xl border border-gray-300 bg-white/95 px-3 py-2 shadow-[var(--shadow-panel)] backdrop-blur-sm dark:border-border dark:bg-background/95",
        className
      )}
    >
      <Select value={locationId} onValueChange={onLocationChange}>
        <SelectTrigger aria-label="Outlet" className="h-9 w-auto min-w-44 max-w-64 gap-2">
          <Store className="h-4 w-4 shrink-0 text-mint" />
          <span className="flex-1 truncate text-left">
            <SelectValue placeholder="All outlets" />
          </span>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_OUTLETS}>All outlets</SelectItem>
          {locations.map((location) => (
            <SelectItem key={String(location.id)} value={String(location.id)}>
              {location.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {mode === "range" ? (
        <>
          <div className="flex items-center gap-1.5">
            <DatePicker
              aria-label="From"
              value={from}
              max={to}
              onChange={(value) => onRangeChange(value, to)}
              className="h-9"
            />
            <span className="text-muted">→</span>
            <DatePicker
              aria-label="To"
              value={to}
              min={from}
              onChange={(value) => onRangeChange(from, value)}
              className="h-9"
            />
            <InfoTip text="Business dates, the last day included." />
          </div>
          <div className="flex items-center gap-0.5">
            {RANGE_PRESETS.map((preset) => (
              <PresetButton
                key={preset.label}
                active={from === preset.from() && to === preset.to()}
                onClick={() => onRangeChange(preset.from(), preset.to())}
              >
                {preset.label}
              </PresetButton>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-1.5">
            <DatePicker aria-label="Business date" value={date} onChange={onDateChange} className="h-9" />
            <InfoTip text="The business date for daily sales, sales by hour and the Z-report." />
          </div>
          <div className="flex items-center gap-0.5">
            {DAY_PRESETS.map((preset) => (
              <PresetButton
                key={preset.label}
                active={date === preset.date()}
                onClick={() => onDateChange(preset.date())}
              >
                {preset.label}
              </PresetButton>
            ))}
          </div>
        </>
      )}

      {actions ? <div className="ml-auto flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
