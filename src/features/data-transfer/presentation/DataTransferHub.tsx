"use client";

import type { SheetKind } from "@/core/domain/entities/DataTransfer";
import { ExcelTransferButtons } from "@/presentation/components/excel/ExcelTransferButtons";

const SHEETS: { kind: SheetKind; title: string; label: string; description: string }[] = [
  {
    kind: "users",
    title: "Users",
    label: "users",
    description: "Staff with their role and branch. A password is needed only for new users.",
  },
  {
    kind: "products",
    title: "Products",
    label: "products",
    description: "The menu or catalogue by SKU: name, category, price, unit and type.",
  },
  {
    kind: "stock",
    title: "Stock count",
    label: "stock counts",
    description: "Counted quantity per product and location; only the difference is recorded.",
  },
  {
    kind: "spa-rooms",
    title: "SPA rooms",
    label: "SPA rooms",
    description: "Treatment rooms by location and number: guests, price per session, session length.",
  },
  {
    kind: "ktv-rooms",
    title: "Private VIP Lounges",
    label: "Private VIP Lounges",
    description: "Private VIP Lounges by location and number: guests, price per hour, billing blocks.",
  },
];

/** One place for every Excel template, export and import. */
export function DataTransferHub() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {SHEETS.map((sheet) => (
        <section
          key={sheet.kind}
          className="space-y-3 rounded-xl border border-border bg-background p-5"
        >
          <div>
            <h2 className="text-base font-semibold text-foreground">{sheet.title}</h2>
            <p className="mt-1 text-sm text-muted">{sheet.description}</p>
          </div>
          <ExcelTransferButtons kind={sheet.kind} label={sheet.label} />
        </section>
      ))}
    </div>
  );
}
