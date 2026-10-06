import type { Product, ProductTerms } from "@/core/domain/entities/Product";

/** The simple forms a product can be added or edited with. */
export type QuickType = "menu" | "hostess" | "rate";

export const QUICK_TYPES: QuickType[] = ["menu", "hostess", "rate"];

export const isQuickType = (value: string): value is QuickType =>
  (QUICK_TYPES as string[]).includes(value);

/** Which simple form fits a product; null when only the advanced form does (e.g. a SPA package). */
export function quickTypeOf(product: Product): QuickType | null {
  if (product.kind === "RENTAL" && (product.rents === "KTV_ROOM" || product.rents === "TABLE")) return "rate";
  if (product.kind === "SERVICE" && product.askWhoServed) return "hostess";
  if (product.kind === "ITEM") return "menu";
  return null;
}

/** What a simple form sets by itself, so the user never sees kind, sold by or time blocks. */
export function quickTerms(
  type: QuickType,
  choice: {
    soldAt: ProductTerms["soldAt"];
    perHour: boolean;
    rents: "KTV_ROOM" | "TABLE";
    rentalPlaceIds: string[];
    blockMinutes: number;
    minimumBlocks: number;
  },
): ProductTerms {
  if (type === "hostess") {
    return {
      kind: "SERVICE",
      soldAt: ["KTV"],
      soldBy: choice.perHour ? "TIME" : "EACH",
      timeBlockMinutes: choice.perHour ? 60 : null,
      minimumBlocks: choice.perHour ? 1 : null,
      rents: null,
      rentalPlaceIds: [],
      askWhoServed: true,
    };
  }
  if (type === "rate") {
    return {
      kind: "RENTAL",
      soldAt: [choice.rents === "KTV_ROOM" ? "KTV" : "BAR"],
      soldBy: "TIME",
      timeBlockMinutes: choice.blockMinutes,
      minimumBlocks: Math.max(1, choice.minimumBlocks),
      rents: choice.rents,
      rentalPlaceIds: choice.rentalPlaceIds,
      askWhoServed: false,
    };
  }
  return {
    kind: "ITEM",
    soldAt: choice.soldAt,
    soldBy: "EACH",
    timeBlockMinutes: null,
    minimumBlocks: null,
    rents: null,
    rentalPlaceIds: [],
    askWhoServed: false,
  };
}

/** A unique code for a new product; staff never type one. */
export function autoSku(type: QuickType): string {
  const prefix = { menu: "MENU", hostess: "HOST", rate: "RATE" }[type];
  const stamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${stamp}${random}`;
}

/** The unit a new product is counted in: an hour for time, otherwise one piece. */
export function pickUom<T extends { name: string; abbreviation?: string | null }>(
  uoms: T[],
  byTime: boolean,
): T | undefined {
  const matches = (pattern: RegExp) =>
    uoms.find((u) => pattern.test(u.name) || pattern.test(u.abbreviation ?? ""));
  return (byTime ? matches(/^(hour|hours|hr|hrs|h)$/i) : undefined) ??
    matches(/^(each|ea|pc|pcs|piece|pieces|unit|units|nos?)$/i) ??
    uoms[0];
}
