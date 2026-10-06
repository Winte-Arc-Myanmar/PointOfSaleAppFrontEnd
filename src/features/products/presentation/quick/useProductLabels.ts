"use client";

import { useCurrency } from "@/presentation/providers/CurrencyProvider";
import { useLanguage } from "@/presentation/providers/LanguageProvider";
import type { Product } from "@/core/domain/entities/Product";

/** Everyday labels for a product: its price with the unit, and the places it is for. */
export function useProductLabels() {
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();

  const priceWithUnit = (product: Product) => {
    const unit =
      product.soldBy !== "TIME"
        ? t("addProduct.unitCall")
        : product.timeBlockMinutes === 30
          ? t("addProduct.unitHalfHour")
          : t("addProduct.unitHour");
    return t("addProduct.perUnit").replace("{price}", formatPrice(product.basePrice)).replace("{unit}", unit);
  };

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

  return { priceWithUnit, placeKind, placesOf };
}
