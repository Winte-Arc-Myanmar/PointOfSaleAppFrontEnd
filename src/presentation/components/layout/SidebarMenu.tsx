"use client";

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Package,
  LogOut,
  Building2,
  Users,
  Shield,
  Ruler,
  FolderTree,
  MapPin,
  Warehouse,
  ScrollText,
  Truck,
  UserRound,
  ShieldPlus,
  UserRoundPlus,
  KeyRound,
  UserCog,
  Gift,
  MessageSquareText,
  Upload,
  Receipt,
  Percent,
  Monitor,
  Clock,
  CreditCard,
  ShoppingCart,
  RotateCcw,
  BookText,
  CalendarRange,
  ArrowLeftRight,
  BadgePercent,
  NotebookPen,
  ListTree,
  Landmark,
  GitCompareArrows,
  Building,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/presentation/hooks/useMediaQuery";
import { AppLogo } from "@/presentation/components/brand/AppLogo";
import { PoweredByWinterArc } from "@/presentation/components/brand/poweredByWinterArcAnimation";
import { usePermissions } from "@/presentation/hooks/usePermissions";
import { useLanguage } from "@/presentation/providers/LanguageProvider";
import type { TranslationKey } from "@/presentation/i18n/translations";

interface MenuItem {
  href: string;
  labelKey: TranslationKey;
  icon: typeof Package;
  permissions?: string[];
  /** Only visible to systemAdmin (ignores permission check). */
  adminOnly?: boolean;
}

const allMenuItems: MenuItem[] = [
  { href: "/customers", labelKey: "nav.customers", icon: UserRound, permissions: ["customers:read"] },
  {
    href: "/customer-interactions",
    labelKey: "nav.interactions",
    icon: MessageSquareText,
    permissions: ["customer-interactions:read"],
  },
  {
    href: "/loyalty-ledger",
    labelKey: "nav.loyaltyLedger",
    icon: Gift,
    permissions: ["loyalty-ledger:read"],
  },
  { href: "/vendors", labelKey: "nav.vendors", icon: Truck, permissions: ["vendors:read"] },
  { href: "/products", labelKey: "nav.products", icon: Package, permissions: ["products:read"] },
  { href: "/tenants", labelKey: "nav.tenants", icon: Building2, permissions: ["tenants:read"] },
  { href: "/users", labelKey: "nav.users", icon: Users, permissions: ["users:read"] },
  { href: "/roles", labelKey: "nav.roles", icon: Shield, permissions: ["roles:read"] },
  { href: "/categories", labelKey: "nav.categories", icon: FolderTree, permissions: ["categories:read"] },
  { href: "/branches", labelKey: "nav.branches", icon: MapPin, permissions: ["branches:read"] },
  { href: "/locations", labelKey: "nav.locations", icon: Warehouse, permissions: ["locations:read"] },
  {
    href: "/inventory-ledger",
    labelKey: "nav.inventoryLedger",
    icon: ScrollText,
    permissions: ["inventory-ledger:read"],
  },
  { href: "/uom-classes", labelKey: "nav.uomClasses", icon: Ruler, permissions: ["uom:read"] },
  { href: "/uoms", labelKey: "nav.uoms", icon: Ruler, permissions: ["uom:read"] },
  { href: "/uploads", labelKey: "nav.uploads", icon: Upload, permissions: ["uploads:read"] },
  { href: "/sales-orders", labelKey: "nav.salesOrders", icon: Receipt, permissions: ["sales-orders:read"] },
  {
    href: "/promotion-rules",
    labelKey: "nav.promotionRules",
    icon: Percent,
    permissions: ["promotion-rules:read"],
  },
  {
    href: "/pos-registers",
    labelKey: "nav.posRegisters",
    icon: Monitor,
    permissions: ["pos-registers:read"],
  },
  {
    href: "/pos-sessions",
    labelKey: "nav.posSessions",
    icon: Clock,
    permissions: ["pos-sessions:read"],
  },
  {
    href: "/payment-methods",
    labelKey: "nav.paymentMethods",
    icon: CreditCard,
    permissions: ["payment-methods:read"],
  },
  {
    href: "/chart-of-accounts",
    labelKey: "nav.chartOfAccounts",
    icon: BookText,
    permissions: ["chart-of-accounts:read"],
  },
  {
    href: "/accounting-periods",
    labelKey: "nav.accountingPeriods",
    icon: CalendarRange,
    permissions: ["accounting-periods:read"],
  },
  {
    href: "/exchange-rates",
    labelKey: "nav.exchangeRates",
    icon: ArrowLeftRight,
    permissions: ["exchange-rates:read"],
  },
  {
    href: "/tax-rates",
    labelKey: "nav.taxRates",
    icon: BadgePercent,
    permissions: ["tax-rates:read"],
  },
  {
    href: "/journal-entries",
    labelKey: "nav.journalEntries",
    icon: NotebookPen,
    permissions: ["journal-entries:read"],
  },
  {
    href: "/journal-lines",
    labelKey: "nav.journalLines",
    icon: ListTree,
    permissions: ["journal-lines:read"],
  },
  {
    href: "/bank-statements",
    labelKey: "nav.bankStatements",
    icon: Landmark,
    permissions: ["bank-statements:read"],
  },
  {
    href: "/bank-statement-lines",
    labelKey: "nav.bankStatementLines",
    icon: ListTree,
    permissions: ["bank-statement-lines:read"],
  },
  {
    href: "/reconciliation-matches",
    labelKey: "nav.reconciliationMatches",
    icon: GitCompareArrows,
    permissions: ["reconciliation-matches:read"],
  },
  {
    href: "/fixed-assets",
    labelKey: "nav.fixedAssets",
    icon: Building,
    permissions: ["fixed-assets:read"],
  },
  {
    href: "/checkout",
    labelKey: "nav.checkout",
    icon: ShoppingCart,
    permissions: ["sales:checkout:write"],
  },
  {
    href: "/refunds",
    labelKey: "nav.refunds",
    icon: RotateCcw,
    permissions: ["sales:refund:write", "sales:refund:read"],
  },
];

const adminMenuItems: MenuItem[] = [
  { href: "/admin/onboard", labelKey: "nav.onboardTenant", icon: ShieldPlus, adminOnly: true },
  { href: "/admin/create-user", labelKey: "nav.createUser", icon: UserRoundPlus, adminOnly: true },
  { href: "/admin/assign-permissions", labelKey: "nav.assignPermissions", icon: KeyRound, adminOnly: true },
  { href: "/admin/assign-role", labelKey: "nav.assignRole", icon: UserCog, adminOnly: true },
];

interface SidebarMenuProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
  pathname: string;
  onMenuNavigate?: (href: string) => void;
}

export function SidebarMenu({
  isOpen,
  isCollapsed,
  onClose,
  pathname,
  onMenuNavigate,
}: SidebarMenuProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const { canAny, isSystemAdmin } = usePermissions();
  const { t } = useLanguage();
  const activeItemRef = useRef<HTMLAnchorElement | null>(null);

  const menuItems = useMemo(() => {
    const items = allMenuItems.filter((item) => {
      if (!item.permissions || item.permissions.length === 0) return true;
      return canAny(...item.permissions);
    });
    if (isSystemAdmin) {
      items.push(...adminMenuItems);
    }
    return items;
  }, [canAny, isSystemAdmin]);

  useEffect(() => {
    // Keep the active route visible in the scrollable sidebar list.
    activeItemRef.current?.scrollIntoView({
      block: "nearest",
      inline: "nearest",
    });
  }, [pathname, menuItems.length]);

  return (
    <>
      <AnimatePresence>
        {isOpen && !isDesktop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-gloss-black/70 backdrop-blur-sm lg:hidden"
            onClick={onClose}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
      <motion.aside
        initial={false}
        animate={{
          x: isDesktop ? 0 : isOpen ? 0 : "-100%",
          width: isCollapsed ? 64 : 288,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30,
          mass: 0.8,
        }}
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full flex-col overflow-hidden border-r border-gray-300 bg-white shadow-sm dark:border-border dark:bg-background dark:shadow-xl lg:static lg:z-auto"
        )}
      >
        <div
          className={cn(
            "flex h-16 shrink-0 items-center border-b border-gray-300 transition-all duration-300 dark:border-mint/20",
            isCollapsed ? "justify-center px-0" : "justify-between px-4"
          )}
        >
          <AppLogo
            href="/products"
            showName={!isCollapsed}
            size={isCollapsed ? "sidebarCollapsed" : "sidebar"}
            onClick={onClose}
            className={cn(
              "text-gray-900 [&:hover]:text-mint dark:text-foreground",
              isCollapsed && "justify-center"
            )}
          />
          {!isCollapsed && (
            <button
              type="button"
              onClick={onClose}
              className="flex size-9 items-center justify-center rounded-lg text-gray-700 transition-colors hover:bg-[#54e3a1]/12 hover:text-[#177a55] dark:text-muted dark:hover:bg-mint/10 dark:hover:text-foreground lg:hidden"
              aria-label={t("common.close")}
            >
              <X className="size-5" strokeWidth={2} />
            </button>
          )}
        </div>

        <nav
          className={cn(
            "hide-scrollbar flex-1 overflow-y-auto py-6 transition-all duration-300",
            isCollapsed ? "px-2" : "px-3"
          )}
        >
          {!isCollapsed && <p className="section-label mb-3 px-3">{t("common.menu")}</p>}
          <ul className="space-y-0.5">
            {menuItems.map(({ href, labelKey, icon: Icon, adminOnly }, i) => {
              const label = t(labelKey);
              const isActive = pathname === href || (href !== "/" && pathname.startsWith(href + "/"));
              const showDivider = adminOnly && i > 0 && !menuItems[i - 1]?.adminOnly;
              return (
                <motion.li
                  key={href}
                  initial={false}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: isCollapsed ? 0 : i * 0.03 }}
                >
                  {showDivider && !isCollapsed && (
                    <p className="section-label mt-5 mb-3 px-3">{t("nav.systemAdmin")}</p>
                  )}
                  <Link
                    href={href}
                    ref={isActive ? activeItemRef : null}
                    onClick={() => {
                      onMenuNavigate?.(href);
                      onClose();
                    }}
                    title={isCollapsed ? label : undefined}
                    className={cn(
                      "group flex items-center rounded-lg text-sm font-medium transition-all duration-200",
                      isCollapsed
                        ? "justify-center px-0 py-2.5"
                        : "gap-3 px-3 py-2.5 pl-3",
                      isActive
                        ? "border border-[#54e3a1]/40 border-l-2 border-l-[#54e3a1] bg-[#54e3a1]/12 text-[#177a55] shadow-sm dark:border-mint/20 dark:border-l-mint dark:bg-mint/15 dark:text-foreground"
                        : "border-l-2 border-l-transparent text-gray-700 hover:bg-[#54e3a1]/10 hover:text-[#177a55] dark:text-muted dark:hover:bg-mint/10 dark:hover:text-foreground"
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-5 shrink-0",
                        isActive
                          ? "text-[#2bc787] dark:text-mint"
                          : "text-gray-700 transition-colors group-hover:text-[#2bc787] dark:text-muted dark:group-hover:text-mint"
                      )}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    {!isCollapsed && <span>{label}</span>}
                  </Link>
                </motion.li>
              );
            })}
          </ul>
        </nav>

        <div
          className={cn(
            "shrink-0 border-t border-border transition-all duration-300",
            isCollapsed ? "p-2" : "p-4 space-y-3"
          )}
        >
          {!isCollapsed ? (
            <PoweredByWinterArc variant="compact" className="pb-1" />
          ) : (
            <PoweredByWinterArc variant="compact" className="pb-1 [&_.powered-by-winter-arc-text]:sr-only" />
          )}
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            title={isCollapsed ? t("common.signOut") : undefined}
            className={cn(
              "group flex w-full items-center rounded-lg text-sm font-medium text-gray-700 transition-colors hover:bg-[#54e3a1]/10 hover:text-[#177a55] dark:text-muted dark:hover:bg-mint/10 dark:hover:text-foreground",
              isCollapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"
            )}
          >
            <LogOut className="size-5 shrink-0 text-gray-700 transition-colors group-hover:text-[#2bc787] dark:text-muted" strokeWidth={2} />
            {!isCollapsed && <span>{t("common.signOut")}</span>}
          </button>
        </div>
      </motion.aside>
    </>
  );
}
