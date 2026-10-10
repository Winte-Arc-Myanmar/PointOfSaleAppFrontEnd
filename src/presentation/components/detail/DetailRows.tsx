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

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Raw record IDs - an "… ID" row holding a UUID, or nothing - kept for support
 * and out of everyone else's way. A User ID people sign in with stays in view.
 */
const isIdRow = (row: DetailRowItem) =>
  /\bIDs?$/.test(row.label) &&
  (typeof row.value !== "string" || row.value === "—" || UUID.test(row.value.trim()));

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
