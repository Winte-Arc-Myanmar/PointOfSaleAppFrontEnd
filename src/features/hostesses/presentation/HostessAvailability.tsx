"use client";

import { useState } from "react";
import { Input } from "@/presentation/components/ui/input";
import type { HostessShift } from "@/core/domain/entities/Hostess";

/** Monday first, as the week is read; 0 is Sunday on the server. */
const DAYS = [
  { dayOfWeek: 1, label: "Mon" },
  { dayOfWeek: 2, label: "Tue" },
  { dayOfWeek: 3, label: "Wed" },
  { dayOfWeek: 4, label: "Thu" },
  { dayOfWeek: 5, label: "Fri" },
  { dayOfWeek: 6, label: "Sat" },
  { dayOfWeek: 0, label: "Sun" },
];

const DEFAULT_SHIFT = { from: "18:00", to: "02:00" };

/**
 * When a hostess works: her week, or none for whenever she is active, and her
 * days off. A shift ending at or before it starts runs past midnight.
 */
export function HostessAvailability({
  schedule,
  daysOff,
  onScheduleChange,
  onDaysOffChange,
}: {
  schedule: HostessShift[] | null;
  daysOff: string[];
  onScheduleChange: (schedule: HostessShift[] | null) => void;
  onDaysOffChange: (daysOff: string[]) => void;
}) {
  const [newDayOff, setNewDayOff] = useState("");
  const shiftOf = (dayOfWeek: number) => schedule?.find((s) => s.dayOfWeek === dayOfWeek);
  const setShift = (dayOfWeek: number, shift: { from: string; to: string } | null) => {
    const rest = (schedule ?? []).filter((s) => s.dayOfWeek !== dayOfWeek);
    onScheduleChange(shift ? [...rest, { dayOfWeek, ...shift }] : rest);
  };

  return (
    <fieldset className="space-y-3 rounded-lg border border-border p-3">
      <legend className="px-1 text-sm font-medium">Availability</legend>
      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border border-input"
          checked={schedule !== null}
          onChange={(e) =>
            onScheduleChange(
              e.target.checked
                ? DAYS.map((d) => ({ dayOfWeek: d.dayOfWeek, ...DEFAULT_SHIFT }))
                : null,
            )
          }
        />
        Set her working days and hours
      </label>
      {schedule === null ? (
        <p className="text-xs text-muted-foreground">
          No schedule: the till lists her whenever she is marked working.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[30rem] text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr>
                <th className="py-1 text-left font-medium">Day</th>
                <th className="py-1 text-left font-medium">Works</th>
                <th className="py-1 text-left font-medium">From</th>
                <th className="py-1 text-left font-medium">To</th>
              </tr>
            </thead>
            <tbody>
              {DAYS.map(({ dayOfWeek, label }) => {
                const shift = shiftOf(dayOfWeek);
                return (
                  <tr key={dayOfWeek}>
                    <td className="py-1 pr-2 font-medium">{label}</td>
                    <td className="py-1 pr-2">
                      <input
                        type="checkbox"
                        aria-label={`Works ${label}`}
                        className="h-4 w-4 rounded border border-input"
                        checked={Boolean(shift)}
                        onChange={(e) => setShift(dayOfWeek, e.target.checked ? DEFAULT_SHIFT : null)}
                      />
                    </td>
                    <td className="py-1 pr-2">
                      <Input
                        type="time"
                        aria-label={`${label} from`}
                        disabled={!shift}
                        value={shift?.from ?? ""}
                        onChange={(e) => shift && setShift(dayOfWeek, { ...shift, from: e.target.value })}
                      />
                    </td>
                    <td className="py-1">
                      <Input
                        type="time"
                        aria-label={`${label} to`}
                        disabled={!shift}
                        value={shift?.to ?? ""}
                        onChange={(e) => shift && setShift(dayOfWeek, { ...shift, to: e.target.value })}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="mt-1 text-xs text-muted-foreground">
            A shift that ends at or before it starts runs past midnight, e.g. 18:00 to 02:00.
          </p>
        </div>
      )}
      <div className="space-y-2">
        <p className="text-sm font-medium">Days off</p>
        <div className="flex flex-wrap gap-2">
          {[...daysOff].sort().map((date) => (
            <span
              key={date}
              className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-xs"
            >
              {date}
              <button
                type="button"
                aria-label={`Remove day off ${date}`}
                className="px-1 text-muted-foreground hover:text-red-600"
                onClick={() => onDaysOffChange(daysOff.filter((d) => d !== date))}
              >
                ✕
              </button>
            </span>
          ))}
          {!daysOff.length ? <span className="text-xs text-muted-foreground">None</span> : null}
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="date"
            aria-label="Day off"
            className="w-auto"
            value={newDayOff}
            onChange={(e) => setNewDayOff(e.target.value)}
          />
          <button
            type="button"
            className="h-9 rounded-md border border-border px-3 text-sm disabled:opacity-50"
            disabled={!newDayOff || daysOff.includes(newDayOff)}
            onClick={() => {
              onDaysOffChange([...daysOff, newDayOff]);
              setNewDayOff("");
            }}
          >
            + Add day off
          </button>
        </div>
      </div>
    </fieldset>
  );
}
