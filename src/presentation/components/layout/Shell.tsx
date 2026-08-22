"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import { SidebarMenu } from "./SidebarMenu";
import { Navbar } from "./Navbar";
import { PoweredByWinterArc } from "@/presentation/components/brand/poweredByWinterArcAnimation";
import { AiHelperChat } from "@/features/ai-helper/presentation/AiHelperChat";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/presentation/providers/LanguageProvider";
import type { TranslationKey } from "@/presentation/i18n/translations";

const routeTitles: Record<string, string> = {
  "/products": "Products",
  "/recipes": "Recipes",
  "/bundles": "Bundles",
  "/pricing-schedules": "Pricing Schedules",
  "/modifier-groups": "Modifier Groups",
  "/tenants": "Tenants",
  "/users": "Users",
  "/categories": "Categories",
  "/branches": "Branches",
  "/locations": "Locations",
  "/dining-zones": "Dining Zones",
  "/dining-tables": "Dining Tables",
  "/sections": "Sections",
  "/kitchen-printers": "Kitchen Printers",
  "/table-sessions": "Table Sessions",
  "/kds-stations": "KDS Stations",
  "/kds-tickets": "KDS Tickets",
  "/reservations": "Reservations",
  "/waitlist": "Waitlist",
  "/tip-pools": "Tip Pools",
  "/counter-orders": "Counter Orders",
  "/reports": "Reports",
  "/discount-reasons": "Discount Reasons",
  "/void-reasons": "Void Reasons",
  "/inventory-ledger": "Inventory ledger",
  "/uom-classes": "UOM Classes",
  "/uoms": "UOMs",
  "/roles": "Roles",
  "/admin/onboard": "Onboard tenant",
  "/admin/create-user": "Create user",
  "/admin/assign-permissions": "Assign permissions",
  "/admin/assign-role": "Assign role",
  "/chart-of-accounts": "Chart of Accounts",
  "/accounting-periods": "Accounting Periods",
  "/exchange-rates": "Exchange Rates",
  "/tax-rates": "Tax Rates",
  "/journal-entries": "Journal Entries",
  "/journal-lines": "Journal Lines",
  "/bank-statements": "Bank Statements",
  "/bank-statement-lines": "Bank Statement Lines",
  "/transfer-orders": "Transfer Orders",
  "/transfer-order-lines": "Transfer Order Lines",
  "/purchase-requisitions": "Purchase Requisitions",
  "/purchase-orders": "Purchase Orders",
  "/goods-received-notes": "Goods Received Notes",
  "/grn-lines": "GRN Lines",
  "/vendor-invoices": "Vendor Invoices",
  "/landed-cost-allocations": "Landed Cost Allocations",
  "/reconciliation-matches": "Reconciliation Matches",
  "/fixed-assets": "Fixed Assets",
  "/depreciation-schedules": "Depreciation Schedules",
};

function getTitle(pathname: string): string {
  if (pathname.startsWith("/tenants/") && pathname.endsWith("/edit"))
    return "Edit tenant";
  if (pathname.startsWith("/tenants/")) return "Tenant";
  if (pathname.startsWith("/categories/") && pathname.endsWith("/edit"))
    return "Edit category";
  if (pathname.startsWith("/categories/")) return "Category";
  if (pathname.startsWith("/branches/") && pathname.endsWith("/edit"))
    return "Edit branch";
  if (pathname.startsWith("/branches/")) return "Branch";
  if (pathname.startsWith("/locations/") && pathname.endsWith("/edit"))
    return "Edit location";
  if (pathname.startsWith("/locations/")) return "Location";
  if (pathname.startsWith("/dining-zones/") && pathname.endsWith("/edit"))
    return "Edit dining zone";
  if (pathname.startsWith("/dining-zones/")) return "Dining zone";
  if (pathname.startsWith("/dining-tables/") && pathname.endsWith("/edit"))
    return "Edit dining table";
  if (pathname.startsWith("/dining-tables/")) return "Dining table";
  if (pathname.startsWith("/sections/") && pathname.endsWith("/edit"))
    return "Edit section";
  if (pathname.startsWith("/sections/")) return "Section";
  if (pathname.startsWith("/kitchen-printers/") && pathname.endsWith("/edit"))
    return "Edit kitchen printer";
  if (pathname.startsWith("/kitchen-printers/")) return "Kitchen printer";
  if (pathname.startsWith("/table-sessions/") && pathname.endsWith("/edit"))
    return "Edit table session";
  if (pathname.startsWith("/table-sessions/")) return "Table session";
  if (pathname.startsWith("/kds-stations/") && pathname.endsWith("/edit"))
    return "Edit KDS station";
  if (pathname.startsWith("/kds-stations/")) return "KDS station";
  if (pathname.startsWith("/kds-tickets/")) return "KDS ticket";
  if (pathname.startsWith("/reservations/") && pathname.endsWith("/edit"))
    return "Edit reservation";
  if (pathname.startsWith("/reservations/")) return "Reservation";
  if (pathname.startsWith("/waitlist/") && pathname.endsWith("/edit"))
    return "Edit waitlist entry";
  if (pathname.startsWith("/waitlist/")) return "Waitlist entry";
  if (pathname.startsWith("/tip-pools/") && pathname.endsWith("/edit"))
    return "Edit tip pool";
  if (pathname.startsWith("/tip-pools/")) return "Tip pool";
  if (pathname.startsWith("/counter-orders/")) return "Counter order";
  if (pathname.startsWith("/inventory-ledger/")) return "Ledger entry";
  if (pathname.startsWith("/uom-classes/") && pathname.endsWith("/edit"))
    return "Edit UOM class";
  if (pathname.startsWith("/uom-classes/")) return "UOM class";
  if (pathname.startsWith("/uoms/") && pathname.endsWith("/edit"))
    return "Edit UOM";
  if (pathname.startsWith("/uoms/")) return "UOM";
  if (pathname.startsWith("/users/") && pathname.endsWith("/edit"))
    return "Edit user";
  if (pathname.startsWith("/users/")) return "User";
  if (pathname.startsWith("/roles/") && pathname.endsWith("/edit"))
    return "Edit role";
  if (pathname.startsWith("/roles/")) return "Role";
  if (pathname.startsWith("/products/") && pathname.endsWith("/edit"))
    return "Edit product";
  if (pathname.startsWith("/products/")) return "Product";
  if (pathname.startsWith("/recipes/") && pathname.endsWith("/edit"))
    return "Edit recipe";
  if (pathname.startsWith("/recipes/")) return "Recipe";
  if (pathname.startsWith("/bundles/") && pathname.endsWith("/edit"))
    return "Edit bundle";
  if (pathname.startsWith("/bundles/")) return "Bundle";
  if (pathname.startsWith("/pricing-schedules/") && pathname.endsWith("/edit"))
    return "Edit pricing schedule";
  if (pathname.startsWith("/pricing-schedules/")) return "Pricing schedule";
  if (pathname.startsWith("/modifier-groups/") && pathname.endsWith("/edit"))
    return "Edit modifier group";
  if (pathname.startsWith("/modifier-groups/")) return "Modifier group";
  if (pathname.startsWith("/discount-reasons/") && pathname.endsWith("/edit"))
    return "Edit discount reason";
  if (pathname.startsWith("/discount-reasons/")) return "Discount reason";
  if (pathname.startsWith("/void-reasons/") && pathname.endsWith("/edit"))
    return "Edit void reason";
  if (pathname.startsWith("/void-reasons/")) return "Void reason";
  if (pathname.startsWith("/chart-of-accounts/") && pathname.endsWith("/edit"))
    return "Edit chart account";
  if (pathname.startsWith("/chart-of-accounts/")) return "Chart account";
  if (pathname.startsWith("/accounting-periods/") && pathname.endsWith("/edit"))
    return "Edit accounting period";
  if (pathname.startsWith("/accounting-periods/")) return "Accounting period";
  if (pathname.startsWith("/exchange-rates/") && pathname.endsWith("/edit"))
    return "Edit exchange rate";
  if (pathname.startsWith("/exchange-rates/")) return "Exchange rate";
  if (pathname.startsWith("/tax-rates/") && pathname.endsWith("/edit"))
    return "Edit tax rate";
  if (pathname.startsWith("/tax-rates/")) return "Tax rate";
  if (pathname.startsWith("/journal-entries/") && pathname.endsWith("/edit"))
    return "Edit journal entry";
  if (pathname.startsWith("/journal-entries/")) return "Journal entry";
  if (pathname.startsWith("/journal-lines/") && pathname.endsWith("/edit"))
    return "Edit journal line";
  if (pathname.match(/^\/journal-lines\/[^/]+\/[^/]+$/)) return "Journal line";
  if (pathname.startsWith("/journal-lines/")) return "Journal lines";
  if (pathname.startsWith("/bank-statements/") && pathname.endsWith("/edit"))
    return "Edit bank statement";
  if (pathname.startsWith("/bank-statements/")) return "Bank statement";
  if (pathname.startsWith("/bank-statement-lines/") && pathname.endsWith("/edit"))
    return "Edit bank statement line";
  if (pathname.match(/^\/bank-statement-lines\/[^/]+\/[^/]+$/)) return "Bank statement line";
  if (pathname.startsWith("/bank-statement-lines/")) return "Bank statement lines";
  if (pathname.startsWith("/transfer-orders/") && pathname.endsWith("/edit"))
    return "Edit transfer order";
  if (pathname.startsWith("/transfer-orders/")) return "Transfer order";
  if (pathname.startsWith("/transfer-order-lines/") && pathname.endsWith("/edit"))
    return "Edit transfer order line";
  if (pathname.match(/^\/transfer-order-lines\/[^/]+\/[^/]+$/))
    return "Transfer order line";
  if (pathname.startsWith("/transfer-order-lines/")) return "Transfer order lines";
  if (pathname.startsWith("/purchase-requisitions/") && pathname.endsWith("/edit"))
    return "Edit purchase requisition";
  if (pathname.startsWith("/purchase-requisitions/")) return "Purchase requisition";
  if (pathname.startsWith("/purchase-orders/") && pathname.endsWith("/edit"))
    return "Edit purchase order";
  if (pathname.startsWith("/purchase-orders/")) return "Purchase order";
  if (pathname.startsWith("/goods-received-notes/") && pathname.endsWith("/edit"))
    return "Edit goods received note";
  if (pathname.startsWith("/goods-received-notes/")) return "Goods received note";
  if (pathname.startsWith("/grn-lines/") && pathname.endsWith("/edit"))
    return "Edit GRN line";
  if (pathname.match(/^\/grn-lines\/[^/]+\/[^/]+$/)) return "GRN line";
  if (pathname.startsWith("/grn-lines/")) return "GRN lines";
  if (pathname.startsWith("/vendor-invoices/") && pathname.endsWith("/edit"))
    return "Edit vendor invoice";
  if (pathname.startsWith("/vendor-invoices/")) return "Vendor invoice";
  if (
    pathname.startsWith("/landed-cost-allocations/") &&
    pathname.endsWith("/edit")
  )
    return "Edit landed cost allocation";
  if (pathname.startsWith("/landed-cost-allocations/"))
    return "Landed cost allocation";
  if (pathname.startsWith("/reconciliation-matches/") && pathname.endsWith("/edit"))
    return "Edit reconciliation match";
  if (pathname.startsWith("/reconciliation-matches/")) return "Reconciliation match";
  if (pathname.startsWith("/fixed-assets/") && pathname.endsWith("/edit"))
    return "Edit fixed asset";
  if (pathname.startsWith("/fixed-assets/")) return "Fixed asset";
  if (
    pathname.startsWith("/depreciation-schedules/") &&
    pathname.endsWith("/edit")
  )
    return "Edit depreciation schedule";
  if (pathname.match(/^\/depreciation-schedules\/[^/]+\/[^/]+$/))
    return "Depreciation schedule";
  if (pathname.startsWith("/depreciation-schedules/")) return "Depreciation schedules";
  return routeTitles[pathname] ?? "";
}

interface ShellProps {
  children: ReactNode;
}

type MenuTabItem = {
  href: string;
  labelKey: TranslationKey;
};

const TAB_STORAGE_KEY = "pos-open-menu-tabs";

const TAB_MENU_ITEMS: MenuTabItem[] = [
  { href: "/customers", labelKey: "nav.customers" },
  { href: "/customer-interactions", labelKey: "nav.interactions" },
  { href: "/loyalty-ledger", labelKey: "nav.loyaltyLedger" },
  { href: "/vendors", labelKey: "nav.vendors" },
  { href: "/products", labelKey: "nav.products" },
  { href: "/recipes", labelKey: "nav.recipes" },
  { href: "/bundles", labelKey: "nav.bundles" },
  { href: "/pricing-schedules", labelKey: "nav.pricingSchedules" },
  { href: "/modifier-groups", labelKey: "nav.modifierGroups" },
  { href: "/tenants", labelKey: "nav.tenants" },
  { href: "/users", labelKey: "nav.users" },
  { href: "/roles", labelKey: "nav.roles" },
  { href: "/categories", labelKey: "nav.categories" },
  { href: "/branches", labelKey: "nav.branches" },
  { href: "/locations", labelKey: "nav.locations" },
  { href: "/dining-zones", labelKey: "nav.diningZones" },
  { href: "/dining-tables", labelKey: "nav.diningTables" },
  { href: "/sections", labelKey: "nav.sections" },
  { href: "/kitchen-printers", labelKey: "nav.kitchenPrinters" },
  { href: "/table-sessions", labelKey: "nav.tableSessions" },
  { href: "/kds-stations", labelKey: "nav.kdsStations" },
  { href: "/kds-tickets", labelKey: "nav.kdsTickets" },
  { href: "/reservations", labelKey: "nav.reservations" },
  { href: "/waitlist", labelKey: "nav.waitlist" },
  { href: "/tip-pools", labelKey: "nav.tipPools" },
  { href: "/counter-orders", labelKey: "nav.counterOrders" },
  { href: "/inventory-ledger", labelKey: "nav.inventoryLedger" },
  { href: "/uom-classes", labelKey: "nav.uomClasses" },
  { href: "/uoms", labelKey: "nav.uoms" },
  { href: "/uploads", labelKey: "nav.uploads" },
  { href: "/sales-orders", labelKey: "nav.salesOrders" },
  { href: "/reports", labelKey: "nav.reports" },
  { href: "/promotion-rules", labelKey: "nav.promotionRules" },
  { href: "/discount-reasons", labelKey: "nav.discountReasons" },
  { href: "/void-reasons", labelKey: "nav.voidReasons" },
  { href: "/pos-registers", labelKey: "nav.posRegisters" },
  { href: "/pos-sessions", labelKey: "nav.posSessions" },
  { href: "/payment-methods", labelKey: "nav.paymentMethods" },
  { href: "/chart-of-accounts", labelKey: "nav.chartOfAccounts" },
  { href: "/accounting-periods", labelKey: "nav.accountingPeriods" },
  { href: "/exchange-rates", labelKey: "nav.exchangeRates" },
  { href: "/tax-rates", labelKey: "nav.taxRates" },
  { href: "/journal-entries", labelKey: "nav.journalEntries" },
  { href: "/journal-lines", labelKey: "nav.journalLines" },
  { href: "/bank-statements", labelKey: "nav.bankStatements" },
  { href: "/bank-statement-lines", labelKey: "nav.bankStatementLines" },
  { href: "/transfer-orders", labelKey: "nav.transferOrders" },
  { href: "/transfer-order-lines", labelKey: "nav.transferOrderLines" },
  { href: "/purchase-requisitions", labelKey: "nav.purchaseRequisitions" },
  { href: "/purchase-orders", labelKey: "nav.purchaseOrders" },
  { href: "/goods-received-notes", labelKey: "nav.goodsReceivedNotes" },
  { href: "/grn-lines", labelKey: "nav.grnLines" },
  { href: "/vendor-invoices", labelKey: "nav.vendorInvoices" },
  { href: "/landed-cost-allocations", labelKey: "nav.landedCostAllocations" },
  { href: "/reconciliation-matches", labelKey: "nav.reconciliationMatches" },
  { href: "/fixed-assets", labelKey: "nav.fixedAssets" },
  { href: "/depreciation-schedules", labelKey: "nav.depreciationSchedules" },
  { href: "/checkout", labelKey: "nav.checkout" },
  { href: "/refunds", labelKey: "nav.refunds" },
  { href: "/admin/onboard", labelKey: "nav.onboardTenant" },
  { href: "/admin/create-user", labelKey: "nav.createUser" },
  { href: "/admin/assign-permissions", labelKey: "nav.assignPermissions" },
  { href: "/admin/assign-role", labelKey: "nav.assignRole" },
];

function getMenuBase(pathname: string): MenuTabItem | null {
  return (
    TAB_MENU_ITEMS.find(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
    ) ?? null
  );
}

function persistTabs(tabs: MenuTabItem[]) {
  try {
    localStorage.setItem(TAB_STORAGE_KEY, JSON.stringify(tabs));
  } catch {
    // Ignore storage failures in private mode or restricted environments.
  }
}

export function Shell({ children }: ShellProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openTabs, setOpenTabs] = useState<MenuTabItem[]>([]);
  const [tabsLoaded, setTabsLoaded] = useState(false);
  const title = getTitle(pathname);
  const activeMenu = useMemo(() => getMenuBase(pathname), [pathname]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(TAB_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as MenuTabItem[];
      if (!Array.isArray(parsed)) return;
      const nextTabs = parsed.filter(
        (item) =>
          typeof item?.href === "string" &&
          typeof item?.labelKey === "string" &&
          TAB_MENU_ITEMS.some((m) => m.href === item.href),
      );
      setOpenTabs(nextTabs);
    } catch {
      // Ignore storage failures in private mode or restricted environments.
    }
    setTabsLoaded(true);
  }, []);

  useEffect(() => {
    if (!tabsLoaded) return;
    persistTabs(openTabs);
  }, [openTabs, tabsLoaded]);

  useEffect(() => {
    if (!tabsLoaded || pathname !== "/checkout") return;

    const checkoutTab = TAB_MENU_ITEMS.find(
      (item) => item.href === "/checkout",
    );
    if (!checkoutTab) return;

    const cleanupTimer = window.setTimeout(() => {
      setOpenTabs((currentTabs) => {
        const isCheckoutOnly =
          currentTabs.length === 1 &&
          currentTabs[0]?.href === checkoutTab.href;

        return isCheckoutOnly ? currentTabs : [checkoutTab];
      });
    }, 0);

    return () => window.clearTimeout(cleanupTimer);
  }, [pathname, tabsLoaded]);

  const displayedTabs = useMemo(() => {
    if (!activeMenu) return openTabs;
    if (openTabs.some((t) => t.href === activeMenu.href)) return openTabs;
    return [...openTabs, activeMenu];
  }, [openTabs, activeMenu]);

  function handleMenuNavigate(href: string) {
    const menu = TAB_MENU_ITEMS.find((item) => item.href === href);
    if (!menu) return;
    setOpenTabs((prev) => {
      if (prev.some((t) => t.href === menu.href)) {
        persistTabs(prev);
        return prev;
      }
      const nextTabs = [...prev, menu];
      persistTabs(nextTabs);
      return nextTabs;
    });
  }

  function handleCloseTab(href: string) {
    const idx = openTabs.findIndex((t) => t.href === href);
    if (idx < 0) return;

    const nextTabs = openTabs.filter((t) => t.href !== href);
    const isClosingActive =
      pathname === href || pathname.startsWith(`${href}/`);

    setOpenTabs(nextTabs);
    persistTabs(nextTabs);

    if (isClosingActive) {
      const fallback = nextTabs[idx] ?? nextTabs[idx - 1] ?? null;
      router.push(fallback?.href ?? "/customers");
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <SidebarMenu
        isOpen={menuOpen}
        isCollapsed={isCollapsed}
        onClose={() => setMenuOpen(false)}
        pathname={pathname}
        onMenuNavigate={handleMenuNavigate}
      />
      <div className="flex h-screen flex-1 flex-col min-w-0 overflow-hidden">
        <Navbar
          onMenuToggle={() => setMenuOpen(true)}
          onCollapseToggle={() => setIsCollapsed((c) => !c)}
          isCollapsed={isCollapsed}
          title={title}
        />
        {pathname !== "/checkout" && displayedTabs.length > 0 && (
          <div className="border-b border-border bg-background/80 px-6 py-3 lg:px-8">
            <div className="mx-auto grid max-w-6xl grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {displayedTabs.map((tab) => {
                const isActive =
                  pathname === tab.href || pathname.startsWith(`${tab.href}/`);
                return (
                  <div
                    key={tab.href}
                    className={cn(
                      "flex min-w-0 items-center gap-2 rounded-lg border px-3 py-1.5 text-sm shadow-sm",
                      isActive
                        ? "border-mint/40 bg-mint/10 text-foreground"
                        : "border-border bg-background text-muted",
                    )}
                  >
                    <button
                      type="button"
                      className="min-w-0 flex-1 truncate text-left font-medium hover:text-foreground"
                      onClick={() => router.push(tab.href)}
                      title={t(tab.labelKey)}
                    >
                      {t(tab.labelKey)}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCloseTab(tab.href)}
                      className="shrink-0 rounded p-0.5 text-muted hover:bg-muted/20 hover:text-foreground"
                      aria-label={`Close ${t(tab.labelKey)}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="mx-auto max-w-6xl"
          >
            {children}
          </motion.div>
          <PoweredByWinterArc
            variant="footer"
            className="mx-auto mt-10 max-w-6xl border-t border-border/60 pt-6 pb-2"
          />
        </main>
      </div>
      <AiHelperChat />
    </div>
  );
}
