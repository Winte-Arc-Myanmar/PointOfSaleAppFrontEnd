import type { SalesOrderLine } from "@/core/domain/entities/SalesOrderLine";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Ids stored where a name belongs read the same as any other id. */
const UUID_LIKE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_RE.test(value.trim());
}

export function shortId(value: string, visible = 8): string {
  const trimmed = value.trim();
  if (trimmed.length <= visible + 3) return trimmed;
  return `${trimmed.slice(0, visible)}…`;
}

/** A name worth showing. Ids and blanks are not names. */
export function isReadableName(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const text = value.trim();
  return text.length > 0 && !UUID_LIKE.test(text);
}

/** The item a sales order line sold: its product name, else its variant name. */
export function salesOrderLineName(line: {
  productName?: string | null;
  variantName?: string | null;
}): string {
  const named = [line.productName, line.variantName].find(isReadableName);
  return named ? String(named).trim() : "";
}

/** Sales order lines by id, so a refund can show item names instead of line ids. */
export function salesOrderLineNamesById(
  lines: SalesOrderLine[],
): Map<string, string> {
  const names = new Map<string, string>();
  for (const line of lines) {
    const id = String(line.id ?? "").trim();
    const name = salesOrderLineName(line);
    if (id && name) names.set(id, name);
  }
  return names;
}

/** The name of the item a refund line gives back, when it can be resolved. */
export function refundLineItemName(
  line: {
    salesOrderLineId?: string;
    productName?: string | null;
    variantName?: string | null;
  },
  lineNames: Map<string, string>,
): string {
  const named = [line.productName, line.variantName].find(isReadableName);
  if (named) return String(named).trim();
  return lineNames.get(String(line.salesOrderLineId ?? "").trim()) ?? "";
}

/** A refund line's title: the item's name, or its sales order line id when unresolved. */
export function refundLineLabel(
  line: {
    salesOrderLineId?: string;
    productName?: string | null;
    variantName?: string | null;
  },
  lineNames: Map<string, string>,
): string {
  return refundLineItemName(line, lineNames) || String(line.salesOrderLineId ?? "");
}
