import type {
  OrderSnapshot,
  OrderSnapshotLine,
} from "@/core/domain/entities/SalesOrderEdit";

const NOT_CHARGED = ["VOIDED", "COMPED"];

export type LineChange =
  | { kind: "added"; name: string; quantity: string; unitPrice: string }
  | { kind: "removed"; name: string; quantity: string; unitPrice: string }
  | {
      kind: "changed";
      name: string;
      quantity: [string, string] | null;
      unitPrice: [string, string] | null;
      hostess: [string | null, string | null] | null;
    };

export interface TotalChange {
  label: string;
  before: string;
  after: string;
}

const TOTALS: Array<[keyof OrderSnapshot, string]> = [
  ["subtotal", "Subtotal"],
  ["totalDiscount", "Discount"],
  ["totalTax", "Tax"],
  ["serviceCharge", "Service charge"],
  ["tipAmount", "Tip"],
  ["grandTotal", "Total"],
];

const charged = (line?: OrderSnapshotLine) =>
  !!line && !NOT_CHARGED.includes(line.status);

const same = (a: string | null | undefined, b: string | null | undefined) =>
  Number(a ?? 0) === Number(b ?? 0);

export function lineName(line: OrderSnapshotLine): string {
  const product = line.productName ?? "Item";
  return line.variantName ? `${product} (${line.variantName})` : product;
}

/** What happened to each line the bill charged before or after the edit. */
export function lineChanges(
  before: OrderSnapshot,
  after: OrderSnapshot,
): LineChange[] {
  const beforeById = new Map(before.lines.map((line) => [line.id, line]));
  const afterById = new Map(after.lines.map((line) => [line.id, line]));
  const changes: LineChange[] = [];

  for (const old of before.lines) {
    if (!charged(old)) continue;
    const now = afterById.get(old.id);
    if (!charged(now)) {
      changes.push({
        kind: "removed",
        name: lineName(old),
        quantity: old.quantity,
        unitPrice: old.unitPrice,
      });
      continue;
    }
    const quantity = same(old.quantity, now!.quantity)
      ? null
      : ([old.quantity, now!.quantity] as [string, string]);
    const unitPrice = same(old.unitPrice, now!.unitPrice)
      ? null
      : ([old.unitPrice, now!.unitPrice] as [string, string]);
    const hostess =
      (old.hostessId ?? null) === (now!.hostessId ?? null)
        ? null
        : ([old.hostessId, now!.hostessId] as [string | null, string | null]);
    if (quantity || unitPrice || hostess) {
      changes.push({
        kind: "changed",
        name: lineName(now!),
        quantity,
        unitPrice,
        hostess,
      });
    }
  }

  for (const now of after.lines) {
    if (!charged(now) || charged(beforeById.get(now.id))) continue;
    changes.push({
      kind: "added",
      name: lineName(now),
      quantity: now.quantity,
      unitPrice: now.unitPrice,
    });
  }
  return changes;
}

export function totalChanges(
  before: OrderSnapshot,
  after: OrderSnapshot,
): TotalChange[] {
  return TOTALS.filter(([key]) =>
    !same(before[key] as string, after[key] as string),
  ).map(([key, label]) => ({
    label,
    before: before[key] as string,
    after: after[key] as string,
  }));
}

const paymentKey = (snapshot: OrderSnapshot) =>
  snapshot.payments
    .map((payment) => `${payment.method}:${Number(payment.amount)}`)
    .sort()
    .join("|");

export function paymentsChanged(
  before: OrderSnapshot,
  after: OrderSnapshot,
): boolean {
  return paymentKey(before) !== paymentKey(after);
}

export function customerChanged(
  before: OrderSnapshot,
  after: OrderSnapshot,
): boolean {
  return (before.customerId ?? null) !== (after.customerId ?? null);
}
