"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/presentation/providers/LanguageProvider";
import type { TranslationKey } from "@/presentation/i18n/translations";
import type { Product } from "@/core/domain/entities/Product";
import { SpaPackageList } from "@/features/spa/presentation/SpaPackageList";
import { ProductList } from "../ProductList";
import { PricedServiceList, usePriceWithUnit } from "./PricedServiceList";

const TABS = [
  { id: "items", label: "addProduct.itemsTab" },
  { id: "hostess", label: "addProduct.hostessTab" },
  { id: "spa", label: "addProduct.spaTab" },
  { id: "charges", label: "addProduct.chargesTab" },
] as const satisfies readonly { id: string; label: TranslationKey }[];

type TabId = (typeof TABS)[number]["id"];

const isHostessService = (p: Product) => p.kind === "SERVICE" && p.askWhoServed;
const isCharge = (p: Product) => p.kind === "RENTAL";

/** Everything the shop sells and charges for, one tab per kind, each with its own Add. */
export function ItemsAndServices() {
  const router = useRouter();
  const params = useSearchParams();
  const { t } = useLanguage();
  const priceWithUnit = usePriceWithUnit();
  const requested = params.get("tab");
  const tab: TabId = TABS.some((item) => item.id === requested) ? (requested as TabId) : "items";

  const placesOf = (p: Product) => {
    const count = p.rentalPlaceIds.length;
    if (count) return t("addProduct.chosenCount").replace("{count}", String(count));
    return t(
      p.rents === "KTV_ROOM"
        ? "addProduct.allKtvRooms"
        : p.rents === "SPA_ROOM"
          ? "addProduct.allSpaRooms"
          : "addProduct.allTables",
    );
  };
  const placeKind = (p: Product) =>
    t(p.rents === "KTV_ROOM" ? "addProduct.ktvRoom" : p.rents === "SPA_ROOM" ? "addProduct.spaRoom" : "addProduct.tableOrRoom");

  return (
    <div className="space-y-5">
      <p className="page-description">{t("addProduct.pageDescription")}</p>
      <div role="tablist" className="flex flex-wrap gap-1 border-b border-border">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            onClick={() => router.replace(item.id === "items" ? "/products" : `/products?tab=${item.id}`)}
            className={cn(
              "-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors",
              tab === item.id ? "border-mint text-foreground" : "border-transparent text-muted hover:text-foreground",
            )}
          >
            {t(item.label)}
          </button>
        ))}
      </div>

      {tab === "items" ? <ProductList menuOnly /> : null}
      {tab === "hostess" ? (
        <PricedServiceList
          filter={isHostessService}
          addHref="/products/new/hostess"
          addLabel="addProduct.newHostess"
          emptyText="addProduct.emptyHostess"
          note="addProduct.hostessNote"
          columns={[
            { header: "addProduct.colName", cell: (p) => <span className="font-medium">{p.name}</span> },
            { header: "addProduct.colPrice", cell: priceWithUnit },
          ]}
        />
      ) : null}
      {tab === "spa" ? <SpaPackageList /> : null}
      {tab === "charges" ? (
        <PricedServiceList
          filter={isCharge}
          addHref="/products/new/rate"
          addLabel="addProduct.newRate"
          emptyText="addProduct.emptyCharges"
          note="addProduct.chargesNote"
          columns={[
            { header: "addProduct.colName", cell: (p) => <span className="font-medium">{p.name}</span> },
            {
              header: "addProduct.colFor",
              cell: (p) => (
                <span>
                  {placeKind(p)} <span className="text-muted">· {placesOf(p)}</span>
                </span>
              ),
            },
            { header: "addProduct.colPrice", cell: priceWithUnit },
            { header: "addProduct.colMinimum", cell: (p) => p.minimumBlocks ?? 1 },
          ]}
        />
      ) : null}
    </div>
  );
}
