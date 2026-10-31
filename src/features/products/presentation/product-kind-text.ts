import type {
  ProductKind,
  ProductTerms,
  RentalPlace,
} from "@/core/domain/entities/Product";
import type { PosType } from "@/core/domain/entities/PosReport";

export const KIND_OPTIONS: { value: ProductKind; title: string; hint: string }[] = [
  { value: "ITEM", title: "Item", hint: "Food, drinks, goods" },
  { value: "SERVICE", title: "Service", hint: "SPA package, hostess, song request" },
  { value: "RENTAL", title: "Rental", hint: "KTV room, table charge" },
];

export const KIND_LABEL: Record<ProductKind, string> = {
  ITEM: "Item",
  SERVICE: "Service",
  RENTAL: "Rental",
};

export const AREA_LABEL: Record<PosType, string> = {
  BAR: "Restaurant & Bar",
  KTV: "KTV",
  SPA: "SPA",
};

export const PLACE_LABEL: Record<RentalPlace, string> = {
  KTV_ROOM: "KTV room",
  SPA_ROOM: "SPA room",
  TABLE: "Table",
};

export const PLACE_AREA: Record<RentalPlace, PosType> = {
  KTV_ROOM: "KTV",
  SPA_ROOM: "SPA",
  TABLE: "BAR",
};

export const DEFAULT_TERMS: ProductTerms = {
  kind: "ITEM",
  soldAt: [],
  soldBy: "EACH",
  timeBlockMinutes: null,
  minimumBlocks: null,
  rents: null,
  rentalPlaceIds: [],
  askWhoServed: false,
  chargeMode: null,
  autoApply: false,
};

export function soldAtLabel(soldAt: PosType[]): string {
  return soldAt.length ? soldAt.map((a) => AREA_LABEL[a]).join(", ") : "Everywhere";
}

export function soldByLabel(terms: Pick<ProductTerms, "soldBy" | "timeBlockMinutes">): string {
  if (terms.soldBy !== "TIME") return "Each";
  const minutes = terms.timeBlockMinutes ?? 60;
  if (minutes === 60) return "Per hour";
  if (minutes % 60 === 0) return `Per ${minutes / 60} hours`;
  return `Per ${minutes} min`;
}

/** What is missing before the terms can be saved, or null. */
export function termsError(terms: ProductTerms): string | null {
  if (terms.kind === "RENTAL" && !terms.rents) {
    return "Choose what this rental rents.";
  }
  if (terms.soldBy === "TIME" && !(terms.timeBlockMinutes && terms.timeBlockMinutes > 0)) {
    return "Say how many minutes one unit buys.";
  }
  return null;
}
