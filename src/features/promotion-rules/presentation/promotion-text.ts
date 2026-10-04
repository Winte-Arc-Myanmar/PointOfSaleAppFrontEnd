import type { PromotionRule } from "@/core/domain/entities/PromotionRule";
import type { PosType } from "@/core/domain/entities/PosReport";

export const DAYS = [
  { value: 1, short: "Mon" },
  { value: 2, short: "Tue" },
  { value: 3, short: "Wed" },
  { value: 4, short: "Thu" },
  { value: 5, short: "Fri" },
  { value: 6, short: "Sat" },
  { value: 0, short: "Sun" },
];

export const POS_LABEL: Record<PosType, string> = { BAR: "Bar", SPA: "SPA", KTV: "KTV" };

const dayShort = (d: number) => DAYS.find((x) => x.value === d)?.short ?? String(d);

export function daysLabel(days: number[]): string {
  if (!days.length || days.length === 7) return "Every day";
  const set = new Set(days);
  if (set.size === 5 && [1, 2, 3, 4, 5].every((d) => set.has(d))) return "Mon–Fri";
  if (set.size === 2 && set.has(0) && set.has(6)) return "Weekends";
  return DAYS.filter((d) => set.has(d.value)).map((d) => d.short).join(", ");
}

const formatDay = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export function datesLabel(rule: Pick<PromotionRule, "startsOn" | "endsOn">): string | null {
  if (rule.startsOn && rule.endsOn) return `${formatDay(rule.startsOn)} – ${formatDay(rule.endsOn)}`;
  if (rule.startsOn) return `From ${formatDay(rule.startsOn)}`;
  if (rule.endsOn) return `Until ${formatDay(rule.endsOn)}`;
  return null;
}

export function hoursLabel(rule: Pick<PromotionRule, "startTime" | "endTime">): string {
  return rule.startTime && rule.endTime ? `${rule.startTime}–${rule.endTime}` : "All day";
}

export function scheduleLabel(rule: PromotionRule): string {
  return [daysLabel(rule.daysOfWeek), hoursLabel(rule), datesLabel(rule)]
    .filter(Boolean)
    .join(" · ");
}

export function discountLabel(
  rule: Pick<PromotionRule, "discountType" | "discountValue">,
  formatPrice: (value: number) => string,
): string {
  return rule.discountType === "PERCENT_OFF"
    ? `${rule.discountValue}% off`
    : `${formatPrice(rule.discountValue)} off each`;
}

export function scopeLabel(rule: PromotionRule, categoryName: (id: string) => string): string {
  if (rule.appliesTo === "ALL_ITEMS") return "Whole menu";
  if (rule.appliesTo === "CATEGORIES") {
    return rule.categoryIds.map(categoryName).join(", ") || "No categories";
  }
  const names = rule.items.map((i) => i.name);
  return names.length > 3 ? `${names.slice(0, 3).join(", ")} +${names.length - 3}` : names.join(", ");
}

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export type PromotionStatus = "RUNNING" | "WAITING" | "ENDED" | "OFF";

export function statusOf(rule: PromotionRule): PromotionStatus {
  if (!rule.isActive) return "OFF";
  if (rule.runningNow) return "RUNNING";
  if (rule.endsOn && rule.endsOn < today()) return "ENDED";
  return "WAITING";
}

export const STATUS_LABEL: Record<PromotionStatus, string> = {
  RUNNING: "Running now",
  WAITING: "Not running now",
  ENDED: "Ended",
  OFF: "Off",
};

export const STATUS_STYLE: Record<PromotionStatus, string> = {
  RUNNING: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  WAITING: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200",
  ENDED: "bg-muted text-muted-foreground",
  OFF: "bg-muted text-muted-foreground",
};

export { dayShort };
