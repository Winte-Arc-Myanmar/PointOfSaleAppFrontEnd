const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Open",
  CONFIRMED: "Open",
  COMPLETED: "Completed",
  ON_HOLD_CREDIT: "On credit",
  VOIDED: "Voided",
  CANCELLED: "Cancelled",
  PARTIALLY_REFUNDED: "Part refunded",
  REFUNDED: "Refunded",
};

export function orderStatusLabel(status?: string | null): string {
  const key = String(status ?? "")
    .trim()
    .toUpperCase();
  if (!key) return "—";
  return (
    STATUS_LABELS[key] ??
    key.charAt(0) + key.slice(1).toLowerCase().replace(/_/g, " ")
  );
}
