"use client";

import type { ReactNode } from "react";
import { DetailRow } from "./DetailRow";

export interface DetailRowItem {
  label: string;
  value: ReactNode;
  mono?: boolean;
}

interface DetailRowsProps {
  rows: DetailRowItem[];
  className?: string;
}

/** Raw record IDs: kept for support, out of the way of everyone else. */
const isIdRow = (row: DetailRowItem) => /\bIDs?$/.test(row.label);

export function DetailRows({ rows, className = "space-y-0" }: DetailRowsProps) {
  const shown = rows.filter((row) => !isIdRow(row));
  const ids = rows.filter(isIdRow);
  return (
    <div className={className}>
      {shown.map((row) => (
        <DetailRow key={row.label} label={row.label} value={row.value} mono={row.mono} />
      ))}
      {ids.length > 0 && (
        <details className="group py-2">
          <summary className="cursor-pointer select-none text-xs font-medium text-muted hover:text-foreground">
            Technical details
          </summary>
          <dl className="mt-1">
            {ids.map((row) => (
              <DetailRow key={row.label} label={row.label} value={row.value} mono />
            ))}
          </dl>
        </details>
      )}
    </div>
  );
}
