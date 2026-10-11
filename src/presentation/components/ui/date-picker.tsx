"use client";

import { useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const pad = (n: number) => String(n).padStart(2, "0");
const toValue = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function parseValue(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : null;
}

export function formatDateValue(value: string): string {
  const date = parseValue(value);
  return date
    ? date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : "";
}

/** The 42 days shown for a month: from the Sunday before the 1st, six weeks. */
function monthGrid(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  return Array.from({ length: 42 }, (_, i) => new Date(year, month, 1 - first.getDay() + i));
}

type DatePickerProps = {
  id?: string;
  /** A YYYY-MM-DD date, the same as a native date input. */
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  placeholder?: string;
  className?: string;
  "aria-label"?: string;
};

export function DatePicker({
  id,
  value,
  onChange,
  min,
  max,
  placeholder = "Pick a date",
  className,
  "aria-label": ariaLabel,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => parseValue(value) ?? new Date());
  const today = toValue(new Date());
  const year = view.getFullYear();
  const month = view.getMonth();
  const outOfRange = (day: string) => (min !== undefined && day < min) || (max !== undefined && day > max);

  const openChange = (next: boolean) => {
    if (next) setView(parseValue(value) ?? new Date());
    setOpen(next);
  };
  const pick = (day: string) => {
    onChange(day);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={openChange}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          aria-label={ariaLabel}
          className={cn(
            "flex h-10 items-center gap-2 rounded-lg border border-gray-400 bg-white px-3 text-sm tracking-[0.02em] text-gray-900 ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-mint focus-visible:ring-offset-2 dark:border-border dark:bg-background dark:text-foreground",
            open && "border-mint dark:border-mint",
            className
          )}
        >
          <CalendarDays className="h-4 w-4 shrink-0 text-mint" />
          <span className={cn("whitespace-nowrap", !value && "text-gray-500 dark:text-muted")}>
            {value ? formatDateValue(value) : placeholder}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72">
        <div className="mb-2 flex items-center justify-between">
          <button
            type="button"
            aria-label="Previous month"
            className="rounded-md p-1.5 text-muted hover:bg-mint/10 hover:text-foreground"
            onClick={() => setView(new Date(year, month - 1, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-semibold">
            {view.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
          </span>
          <button
            type="button"
            aria-label="Next month"
            className="rounded-md p-1.5 text-muted hover:bg-mint/10 hover:text-foreground"
            onClick={() => setView(new Date(year, month + 1, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-0.5 text-center">
          {WEEKDAYS.map((day) => (
            <span key={day} className="py-1 text-xs font-medium text-muted">
              {day}
            </span>
          ))}
          {monthGrid(year, month).map((date) => {
            const day = toValue(date);
            const selected = day === value;
            const disabled = outOfRange(day);
            return (
              <button
                key={day}
                type="button"
                disabled={disabled}
                aria-pressed={selected}
                aria-label={formatDateValue(day)}
                onClick={() => pick(day)}
                className={cn(
                  "h-9 rounded-md text-sm tabular-nums transition-colors disabled:cursor-not-allowed disabled:opacity-30",
                  date.getMonth() !== month && "text-muted/60",
                  selected
                    ? "bg-mint font-semibold text-white dark:text-gloss-black"
                    : "hover:bg-mint/10",
                  day === today && !selected && "font-semibold text-mint ring-1 ring-inset ring-mint/60"
                )}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
        <div className="mt-2 flex justify-end border-t border-border pt-2">
          <button
            type="button"
            disabled={outOfRange(today)}
            className="rounded-md px-2 py-1 text-sm font-medium text-mint hover:bg-mint/10 disabled:opacity-40"
            onClick={() => pick(today)}
          >
            Today
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
