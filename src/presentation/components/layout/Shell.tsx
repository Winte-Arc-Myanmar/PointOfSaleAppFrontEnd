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
import { PoweredByWinterArc } from "@/presentation/components/brand/PoweredByWinterArc";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/presentation/providers/LanguageProvider";
import type { TranslationKey } from "@/presentation/i18n/translations";

const routeTitles: Record<string, string> = {
  "/products": "Products",
  "/tenants": "Tenants",
  "/users": "Users",
  "/categories": "Categories",
  "/branches": "Branches",
  "/locations": "Locations",
  "/inventory-ledger": "Inventory ledger",
  "/uom-classes": "UOM Classes",
  "/uoms": "UOMs",
  "/roles": "Roles",
  "/admin/onboard": "Onboard tenant",
  "/admin/create-user": "Create user",
  "/admin/assign-permissions": "Assign permissions",
  "/admin/assign-role": "Assign role",
  "/chart-of-accounts": "Chart of Accounts",
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
  if (pathname.startsWith("/chart-of-accounts/") && pathname.endsWith("/edit"))
    return "Edit chart account";
  if (pathname.startsWith("/chart-of-accounts/")) return "Chart account";
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
  { href: "/tenants", labelKey: "nav.tenants" },
  { href: "/users", labelKey: "nav.users" },
  { href: "/roles", labelKey: "nav.roles" },
  { href: "/categories", labelKey: "nav.categories" },
  { href: "/branches", labelKey: "nav.branches" },
  { href: "/locations", labelKey: "nav.locations" },
  { href: "/inventory-ledger", labelKey: "nav.inventoryLedger" },
  { href: "/uom-classes", labelKey: "nav.uomClasses" },
  { href: "/uoms", labelKey: "nav.uoms" },
  { href: "/uploads", labelKey: "nav.uploads" },
  { href: "/sales-orders", labelKey: "nav.salesOrders" },
  { href: "/promotion-rules", labelKey: "nav.promotionRules" },
  { href: "/pos-registers", labelKey: "nav.posRegisters" },
  { href: "/pos-sessions", labelKey: "nav.posSessions" },
  { href: "/payment-methods", labelKey: "nav.paymentMethods" },
  { href: "/chart-of-accounts", labelKey: "nav.chartOfAccounts" },
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

export function Shell({ children }: ShellProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openTabs, setOpenTabs] = useState<MenuTabItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(TAB_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as MenuTabItem[];
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(
        (item) =>
          typeof item?.href === "string" &&
          typeof item?.labelKey === "string" &&
          TAB_MENU_ITEMS.some((m) => m.href === item.href),
      );
    } catch {
      return [];
    }
  });
  const title = getTitle(pathname);
  const activeMenu = useMemo(() => getMenuBase(pathname), [pathname]);

  useEffect(() => {
    try {
      localStorage.setItem(TAB_STORAGE_KEY, JSON.stringify(openTabs));
    } catch {
      // Ignore storage failures in private mode or restricted environments.
    }
  }, [openTabs]);

  const displayedTabs = useMemo(() => {
    if (!activeMenu) return openTabs;
    if (openTabs.some((t) => t.href === activeMenu.href)) return openTabs;
    return [...openTabs, activeMenu];
  }, [openTabs, activeMenu]);

  function handleMenuNavigate(href: string) {
    const menu = TAB_MENU_ITEMS.find((item) => item.href === href);
    if (!menu) return;
    setOpenTabs((prev) => {
      if (prev.some((t) => t.href === menu.href)) return prev;
      return [...prev, menu];
    });
  }

  function handleCloseTab(href: string) {
    const idx = openTabs.findIndex((t) => t.href === href);
    if (idx < 0) return;

    const nextTabs = openTabs.filter((t) => t.href !== href);
    const isClosingActive =
      pathname === href || pathname.startsWith(`${href}/`);

    setOpenTabs(nextTabs);

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
        {displayedTabs.length > 0 && (
          <div className="border-b border-border bg-background/80 px-6 py-3 lg:px-8">
            <div className="mx-auto flex max-w-6xl items-center gap-2 overflow-x-auto">
              {displayedTabs.map((tab) => {
                const isActive =
                  pathname === tab.href || pathname.startsWith(`${tab.href}/`);
                return (
                  <div
                    key={tab.href}
                    className={cn(
                      "flex shrink-0 items-center gap-2 rounded-lg border px-3 py-1.5 text-sm",
                      isActive
                        ? "border-mint/40 bg-mint/10 text-foreground"
                        : "border-border bg-background text-muted",
                    )}
                  >
                    <button
                      type="button"
                      className="font-medium hover:text-foreground"
                      onClick={() => router.push(tab.href)}
                    >
                      {t(tab.labelKey)}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCloseTab(tab.href)}
                      className="rounded p-0.5 text-muted hover:bg-muted/20 hover:text-foreground"
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
    </div>
  );
}
