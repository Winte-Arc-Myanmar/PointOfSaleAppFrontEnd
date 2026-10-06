"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/presentation/providers/LanguageProvider";
import type { TranslationKey } from "@/presentation/i18n/translations";
import { SpaPackageList } from "@/features/spa/presentation/SpaPackageList";
import { ProductList } from "../ProductList";

const TABS = [
  { id: "items", label: "addProduct.itemsTab" },
  { id: "hostess", label: "addProduct.hostessTab" },
  { id: "spa", label: "addProduct.spaTab" },
  { id: "charges", label: "addProduct.chargesTab" },
] as const satisfies readonly { id: string; label: TranslationKey }[];

type TabId = (typeof TABS)[number]["id"];

/** Everything the shop sells and charges for, one tab per kind, each with its own Add. */
export function ItemsAndServices() {
  const router = useRouter();
  const params = useSearchParams();
  const { t } = useLanguage();
  const requested = params.get("tab");
  const tab: TabId = TABS.some((item) => item.id === requested) ? (requested as TabId) : "items";

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

      {tab === "items" ? <ProductList scope="menu" /> : null}
      {tab === "hostess" ? <ProductList scope="hostess" /> : null}
      {tab === "spa" ? <SpaPackageList /> : null}
      {tab === "charges" ? <ProductList scope="charges" /> : null}
    </div>
  );
}
