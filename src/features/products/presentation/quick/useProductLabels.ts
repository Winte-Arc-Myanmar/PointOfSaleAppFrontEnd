"use client";

import { useCurrency } from "@/presentation/providers/CurrencyProvider";
import { useLanguage } from "@/presentation/providers/LanguageProvider";
import type { Product } from "@/core/domain/entities/Product";

/** Everyday labels for a product: its price with the unit, and the places it is for. */
export function useProductLabels() {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();

  const priceWithUnit = (product: Product) => {
    const price = formatPrice(product.basePrice);
    if (product.soldBy !== "TIME") {
      return product.kind === "RENTAL"
        ? `${price} · ${t("addProduct.unitFixed")}`
        : t("addProduct.perUnit").replace("{price}", price).replace("{unit}", t("addProduct.unitCall"));
    }
    const minutes = product.timeBlockMinutes ?? 60;
    const unit =
      minutes === 30
        ? t("addProduct.unitHalfHour")
        : minutes === 60
          ? t("addProduct.unitHour")
          : t("addProduct.unitHours").replace("{count}", String(minutes / 60));
    return t("addProduct.perUnit").replace("{price}", price).replace("{unit}", unit);
  };

  /** Short tags for how a charge works: on a clock, added by itself. */
  const chargeTags = (product: Product) =>
    [
      product.chargeMode === "CLOCK" ? t("addProduct.clockTag") : null,
      product.autoApply ? t("addProduct.autoTag") : null,
    ].filter(Boolean) as string[];

  const placeKind = (product: Product) =>
    t(
      product.rents === "KTV_ROOM"
        ? "addProduct.ktvRoom"
        : product.rents === "SPA_ROOM"
          ? "addProduct.spaRoom"
          : "addProduct.tableOrRoom",
    );

  const placesOf = (product: Product) => {
    const count = product.rentalPlaceIds.length;
    if (count) return t("addProduct.chosenCount").replace("{count}", String(count));
    return t(
      product.rents === "KTV_ROOM"
        ? "addProduct.allKtvRooms"
        : product.rents === "SPA_ROOM"
          ? "addProduct.allSpaRooms"
          : "addProduct.allTables",
    );
  };

  return { priceWithUnit, placeKind, placesOf, chargeTags };
}
