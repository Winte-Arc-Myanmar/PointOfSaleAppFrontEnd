/**
 * Product entity.
 * Domain layer - no framework dependencies.
 */

import type { Id } from "@/core/domain/types";
import type { PosType } from "@/core/domain/entities/PosReport";

/** Goods, something a person does, or the use of a place. */
export type ProductKind = "ITEM" | "SERVICE" | "RENTAL";
export type SoldBy = "EACH" | "TIME";
export type RentalPlace = "KTV_ROOM" | "SPA_ROOM" | "TABLE";
/** PAY_FIRST: blocks paid up front. CLOCK: time runs until the bill closes. */
export type ChargeMode = "PAY_FIRST" | "CLOCK";

/** How a product is classified and sold. */
export interface ProductTerms {
  kind: ProductKind;
  /** POS areas it is sold at; empty means every area. */
  soldAt: PosType[];
  soldBy: SoldBy;
  /** TIME: minutes one unit buys (60 = per hour) and the fewest units sold. */
  timeBlockMinutes: number | null;
  minimumBlocks: number | null;
  /** RENTAL: the kind of place, and which of them; empty means all. */
  rents: RentalPlace | null;
  rentalPlaceIds: string[];
  /** SERVICE: the till asks which staff member gave it. */
  askWhoServed: boolean;
  /** RENTAL sold by time: paid up front or on a running clock. */
  chargeMode: ChargeMode | null;
  /** RENTAL of tables or SPA rooms: added by itself when the place opens. */
  autoApply: boolean;
}

export interface Product extends ProductTerms {
  id: Id;
  name: string;
  tenantId: string;
  baseSku: string;
  basePrice: number;
  baseUomId: string;
  categoryId: string;
  /** Resolved from API category.name when present */
  categoryName?: string;
  /** Resolved from API category.description when present */
  categoryDescription?: string;
  /** Resolved from API baseUom.name or baseUom.abbreviation when present */
  baseUomName?: string;
  /** From API category when present */
  categoryParentId?: string | null;
  categorySortOrder?: number;
  categoryCreatedAt?: string;
  categoryUpdatedAt?: string;
  /** From API baseUom when present */
  baseUomClassId?: string;
  baseUomConversionRateToBase?: number;
  globalAttributes?: Record<string, unknown>;
  trackingType: string;
  imageUrl?: string | null;
  isTaxable?: boolean;
  isAvailable: boolean;
  taxRateId?: string | null;
  /** Resolved when API embeds `taxRate` on product */
  taxRateName?: string;
  /** Resolved when API embeds `taxRate` on product */
  taxRateRatePercentage?: number;
  /** Resolved when API embeds `taxRate` on product */
  taxRateIsPriceInclusive?: boolean;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
