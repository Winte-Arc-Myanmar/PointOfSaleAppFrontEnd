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

export function DetailRows({ rows, className = "space-y-0" }: DetailRowsProps) {
  return (
    <div className={className}>
      {rows.map((row) => (
        <DetailRow key={row.label} label={row.label} value={row.value} mono={row.mono} />
      ))}
    </div>
  );
}
