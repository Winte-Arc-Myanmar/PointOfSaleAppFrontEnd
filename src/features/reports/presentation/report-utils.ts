export function formatMoney(value: string | number | null | undefined): string {
  if (value == null || value === "") return "—";
  const n = typeof value === "number" ? value : Number(String(value).trim());
  return Number.isFinite(n) ? n.toFixed(2) : "—";
}

/** Format quantity sold (backend sends decimal strings like "48.0000"). */
export function formatQuantity(value: string | number | null | undefined): string {
  if (value == null || value === "") return "—";
  const n = typeof value === "number" ? value : Number(String(value).trim());
  if (!Number.isFinite(n)) return "—";
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, "");
}

export function formatHour(hour: number): string {
  if (!Number.isFinite(hour) || hour < 0 || hour > 23) return "—";
  const period = hour >= 12 ? "PM" : "AM";
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${h}:00 ${period}`;
}

export function toDateInputValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function toRangeStart(date: string): string {
  return `${date}T00:00:00Z`;
}

export function toRangeEnd(date: string): string {
  return `${date}T23:59:59Z`;
}

export function startOfMonth(date: Date): string {
  return toDateInputValue(new Date(date.getFullYear(), date.getMonth(), 1));
}

export function withRowIds<T>(
  items: T[],
  getId: (item: T, index: number) => string,
): Array<T & { id: string }> {
  return items.map((item, index) => ({
    ...item,
    id: getId(item, index),
  }));
}
