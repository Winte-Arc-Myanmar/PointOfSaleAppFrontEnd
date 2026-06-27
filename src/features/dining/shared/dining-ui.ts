import type { DiningTable, DiningTableStatus } from "@/core/domain/entities/DiningTable";

export const TABLE_STATUSES: DiningTableStatus[] = [
  "AVAILABLE",
  "OCCUPIED",
  "DIRTY",
  "RESERVED",
];

export const TABLE_SHAPES = ["RECTANGLE", "CIRCLE", "SQUARE"] as const;
export type DiningTableShapeOption = (typeof TABLE_SHAPES)[number];

export const STATUS_CONFIG: Record<
  DiningTableStatus,
  { label: string; shortLabel: string; dotClass: string; tileClass: string; chipClass: string }
> = {
  AVAILABLE: {
    label: "Available",
    shortLabel: "Free",
    dotClass: "bg-emerald-500",
    tileClass:
      "border-emerald-300 bg-emerald-50 text-emerald-900 hover:border-emerald-400 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-100",
    chipClass:
      "border-emerald-200 bg-emerald-50 text-emerald-800 data-[active=true]:bg-emerald-600 data-[active=true]:text-white dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  },
  OCCUPIED: {
    label: "Occupied",
    shortLabel: "Busy",
    dotClass: "bg-blue-500",
    tileClass:
      "border-blue-300 bg-blue-50 text-blue-900 hover:border-blue-400 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-100",
    chipClass:
      "border-blue-200 bg-blue-50 text-blue-800 data-[active=true]:bg-blue-600 data-[active=true]:text-white dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300",
  },
  DIRTY: {
    label: "Dirty",
    shortLabel: "Dirty",
    dotClass: "bg-amber-500",
    tileClass:
      "border-amber-300 bg-amber-50 text-amber-900 hover:border-amber-400 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-100",
    chipClass:
      "border-amber-200 bg-amber-50 text-amber-800 data-[active=true]:bg-amber-600 data-[active=true]:text-white dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300",
  },
  RESERVED: {
    label: "Reserved",
    shortLabel: "Held",
    dotClass: "bg-violet-500",
    tileClass:
      "border-violet-300 bg-violet-50 text-violet-900 hover:border-violet-400 dark:border-violet-800 dark:bg-violet-950/60 dark:text-violet-100",
    chipClass:
      "border-violet-200 bg-violet-50 text-violet-800 data-[active=true]:bg-violet-600 data-[active=true]:text-white dark:border-violet-800 dark:bg-violet-950 dark:text-violet-300",
  },
};

export function getStatusConfig(status: string) {
  return STATUS_CONFIG[status as DiningTableStatus] ?? STATUS_CONFIG.AVAILABLE;
}

export function countTablesByStatus(tables: DiningTable[]) {
  const counts: Record<DiningTableStatus, number> = {
    AVAILABLE: 0,
    OCCUPIED: 0,
    DIRTY: 0,
    RESERVED: 0,
  };
  for (const t of tables) {
    if (t.status in counts) counts[t.status as DiningTableStatus] += 1;
  }
  return counts;
}

export const FLOOR_PLAN_WIDTH = 900;
export const FLOOR_PLAN_HEIGHT = 560;

export const DEFAULT_ZONE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 560" width="900" height="560">
  <rect x="0" y="0" width="900" height="560" fill="#f8fafc" stroke="#e2e8f0" stroke-width="2"/>
  <rect x="40" y="40" width="820" height="480" fill="none" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="8 6"/>
</svg>`;

export const ZONE_LAYOUT_PRESETS: { id: string; label: string; description: string; svg: string }[] = [
  {
    id: "blank",
    label: "Blank floor",
    description: "Empty canvas — add walls and zones in SVG editor",
    svg: DEFAULT_ZONE_SVG,
  },
  {
    id: "main",
    label: "Main dining",
    description: "Open room with service aisle",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 560" width="900" height="560">
  <rect x="0" y="0" width="900" height="560" fill="#f8fafc" stroke="#e2e8f0" stroke-width="2"/>
  <rect x="40" y="40" width="820" height="480" fill="#fff" stroke="#cbd5e1" stroke-width="1"/>
  <rect x="420" y="40" width="60" height="480" fill="#f1f5f9" stroke="#e2e8f0" stroke-width="1"/>
  <text x="450" y="290" text-anchor="middle" fill="#94a3b8" font-size="12" font-family="sans-serif">Aisle</text>
</svg>`,
  },
  {
    id: "patio",
    label: "Patio",
    description: "Outdoor area with perimeter border",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 560" width="900" height="560">
  <rect x="0" y="0" width="900" height="560" fill="#ecfdf5" stroke="#a7f3d0" stroke-width="2"/>
  <rect x="60" y="60" width="780" height="440" fill="none" stroke="#6ee7b7" stroke-width="2" stroke-dasharray="10 8" rx="24"/>
  <text x="450" y="40" text-anchor="middle" fill="#059669" font-size="13" font-family="sans-serif">Patio</text>
</svg>`,
  },
  {
    id: "bar",
    label: "Bar",
    description: "Bar counter with stool area",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 560" width="900" height="560">
  <rect x="0" y="0" width="900" height="560" fill="#faf5ff" stroke="#e9d5ff" stroke-width="2"/>
  <rect x="80" y="80" width="740" height="80" fill="#ede9fe" stroke="#c4b5fd" stroke-width="2" rx="8"/>
  <text x="450" y="130" text-anchor="middle" fill="#7c3aed" font-size="13" font-family="sans-serif">Bar</text>
  <rect x="80" y="200" width="740" height="280" fill="none" stroke="#ddd6fe" stroke-width="1" stroke-dasharray="6 4"/>
</svg>`,
  },
];

export const SHAPE_LABELS: Record<string, string> = {
  RECTANGLE: "Rectangle",
  CIRCLE: "Round",
  SQUARE: "Square",
};

export const TEXTAREA_CLASS =
  "flex w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-mint focus:ring-offset-2";
