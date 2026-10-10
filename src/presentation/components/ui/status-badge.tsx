import { cn } from "@/lib/utils";

type Tone = "good" | "busy" | "wait" | "bad" | "off";

const TONE_CLASS: Record<Tone, string> = {
  good: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  busy: "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  wait: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  bad: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300",
  off: "border-border bg-muted/10 text-muted",
};

const STATUS_TONE: Record<string, Tone> = {
  ACTIVE: "good",
  AVAILABLE: "good",
  OPEN: "good",
  PAID: "good",
  COMPLETED: "good",
  DONE: "good",
  READY: "good",
  SERVED: "good",
  OCCUPIED: "busy",
  IN_USE: "busy",
  IN_PROGRESS: "busy",
  PREPARING: "busy",
  PENDING: "wait",
  RESERVED: "wait",
  CLEANING: "wait",
  DIRTY: "wait",
  HELD: "wait",
  PARTIALLY_PAID: "wait",
  SUSPENDED: "bad",
  BLOCKED: "bad",
  LOST: "bad",
  VOID: "bad",
  VOIDED: "bad",
  CANCELLED: "bad",
  INACTIVE: "off",
  CLOSED: "off",
  EXPIRED: "off",
  REFUNDED: "off",
  ARCHIVED: "off",
};

/** IN_PROGRESS reads "In progress". */
export function statusLabel(status: string): string {
  const words = status.toLowerCase().split("_").join(" ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** The one way a status is shown: the same colour for the same status on every page. */
export function StatusBadge({
  status,
  label,
  className,
}: {
  status: string | null | undefined;
  label?: string;
  className?: string;
}) {
  if (!status) return <span className="text-muted">—</span>;
  const tone = STATUS_TONE[status.toUpperCase()] ?? "off";
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium",
        TONE_CLASS[tone],
        className,
      )}
    >
      {label ?? statusLabel(status)}
    </span>
  );
}
