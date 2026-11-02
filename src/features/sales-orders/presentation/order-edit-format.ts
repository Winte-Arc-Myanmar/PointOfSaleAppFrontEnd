import { formatMoney } from "@/lib/money";

export function formatDifference(previous: string, next: string): string {
  const diff = Number(next) - Number(previous);
  if (!Number.isFinite(diff) || diff === 0) return formatMoney(0);
  return diff > 0 ? `+${formatMoney(diff)}` : `−${formatMoney(-diff)}`;
}

export function differenceTone(previous: string, next: string): string {
  const diff = Number(next) - Number(previous);
  if (diff > 0) return "text-mint";
  if (diff < 0) return "text-red-500";
  return "text-muted";
}

export function personName(person: { fullName: string | null } | null) {
  return person?.fullName?.trim() || "—";
}
