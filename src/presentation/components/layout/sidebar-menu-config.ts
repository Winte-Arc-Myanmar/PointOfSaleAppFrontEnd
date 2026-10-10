import type { LucideIcon } from "lucide-react";
import {
  ArrowLeftRight,
  BadgePercent,
  Ban,
  BarChart3,
  BookText,
  Building,
  Building2,
  CalendarClock,
  CalendarDays,
  CalendarRange,
  ClipboardCheck,
  ClipboardList,
  Clock,
  CreditCard,
  FileSpreadsheet,
  FlaskConical,
  FolderTree,
  Gift,
  GitCompareArrows,
  HandCoins,
  Hourglass,
  Landmark,
  Layers,
  LayoutDashboard,
  LayoutGrid,
  MapPin,
  MessageSquareText,
  Monitor,
  NotebookPen,
  Package,
  Percent,
  Printer,
  Receipt,
  RotateCcw,
  Ruler,
  Scale,
  ScrollText,
  Shield,
  ShieldPlus,
  ShoppingBag,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  Tag,
  Ticket,
  Truck,
  TvMinimal,
  MicVocal,
  Upload,
  UserRound,
  Users,
  UtensilsCrossed,
  Wallet,
  Warehouse,
} from "lucide-react";
import type { TranslationKey } from "@/presentation/i18n/translations";

export interface SidebarMenuItem {
  href: string;
  labelKey: TranslationKey;
  icon: LucideIcon;
  permissions?: string[];
  adminOnly?: boolean;
}

export interface SidebarMenuGroup {
  id: string;
  labelKey: TranslationKey;
  icon: LucideIcon;
  items: SidebarMenuItem[];
  /** Entire group only for system admins (e.g. some admin routes mixed with tenant routes). */
  requiresSystemAdmin?: boolean;
}

export const SIDEBAR_MENU_GROUPS: SidebarMenuGroup[] = [
  {
    id: "daily",
    labelKey: "nav.groupDaily",
    icon: LayoutDashboard,
    items: [
      {
        href: "/dashboard",
        labelKey: "nav.dashboard",
        icon: LayoutDashboard,
        permissions: ["reports:read"],
      },
      {
        href: "/checkout",
        labelKey: "nav.checkout",
        icon: ShoppingCart,
        permissions: ["sales:checkout:write"],
      },
      {
        href: "/spa-rooms",
        labelKey: "nav.spaRooms",
        icon: Sparkles,
        permissions: ["hospitality:spa-room:read"],
      },
      {
        href: "/ktv-rooms",
        labelKey: "nav.ktvRooms",
        icon: TvMinimal,
        permissions: ["hospitality:ktv-room:read"],
      },
      {
        href: "/table-sessions",
        labelKey: "nav.tableSessions",
        icon: ClipboardList,
        permissions: ["table-sessions:read"],
      },
      {
        href: "/counter-orders",
        labelKey: "nav.counterOrders",
        icon: ShoppingBag,
        permissions: ["counter-orders:read"],
      },
      {
        href: "/sales-orders",
        labelKey: "nav.salesOrders",
        icon: Receipt,
        permissions: ["sales-orders:read"],
      },
      {
        href: "/kds-tickets",
        labelKey: "nav.kdsTickets",
        icon: Ticket,
        permissions: ["kds-tickets:read"],
      },
      {
        href: "/reservations",
        labelKey: "nav.reservations",
        icon: CalendarDays,
        permissions: ["reservations:read"],
      },
      {
        href: "/waitlist",
        labelKey: "nav.waitlist",
        icon: Hourglass,
        permissions: ["waitlist:read"],
      },
      {
        href: "/guest-cards",
        labelKey: "nav.guestCards",
        icon: CreditCard,
        permissions: ["guestcard:card:read"],
      },
      {
        href: "/refunds",
        labelKey: "nav.refunds",
        icon: RotateCcw,
        permissions: ["sales:refund:write", "sales:refund:read"],
      },
      {
        href: "/pos-sessions",
        labelKey: "nav.posSessions",
        icon: Clock,
        permissions: ["pos-sessions:read"],
      },
      {
        href: "/reports",
        labelKey: "nav.reports",
        icon: BarChart3,
        permissions: ["reports:read"],
      },
    ],
  },
  {
    id: "setup",
    labelKey: "nav.groupSetup",
    icon: SlidersHorizontal,
    items: [
      {
        href: "/venue-setup",
        labelKey: "nav.venueSetup",
        icon: SlidersHorizontal,
        permissions: ["pos:venue-setting:write"],
      },
      {
        href: "/branches",
        labelKey: "nav.branches",
        icon: MapPin,
        permissions: ["branches:read"],
      },
      {
        href: "/locations",
        labelKey: "nav.locations",
        icon: Warehouse,
        permissions: ["locations:read"],
      },
      {
        href: "/pos-registers",
        labelKey: "nav.posRegisters",
        icon: Monitor,
        permissions: ["pos-registers:read"],
      },
      {
        href: "/printer-setup",
        labelKey: "nav.printerSetup",
        icon: Printer,
        permissions: ["kitchen-printers:read"],
      },
      {
        href: "/kitchen-printers",
        labelKey: "nav.kitchenPrinters",
        icon: Printer,
        permissions: ["kitchen-printers:read"],
      },
      {
        href: "/kds-stations",
        labelKey: "nav.kdsStations",
        icon: TvMinimal,
        permissions: ["kds-stations:read"],
      },
      {
        href: "/sections",
        labelKey: "nav.sections",
        icon: LayoutGrid,
        permissions: ["sections:read"],
      },
      {
        href: "/dining-zones",
        labelKey: "nav.diningZones",
        icon: UtensilsCrossed,
        permissions: ["dining-zones:read"],
      },
      {
        href: "/dining-tables",
        labelKey: "nav.diningTables",
        icon: LayoutGrid,
        permissions: ["dining-tables:read"],
      },
    ],
  },
  {
    id: "product-menu",
    labelKey: "nav.groupProductMenu",
    icon: Package,
    items: [
      {
        href: "/products",
        labelKey: "nav.products",
        icon: Package,
        permissions: ["products:read"],
      },
      {
        href: "/categories",
        labelKey: "nav.categories",
        icon: FolderTree,
        permissions: ["categories:read"],
      },
      {
        href: "/modifier-groups",
        labelKey: "nav.modifierGroups",
        icon: SlidersHorizontal,
        permissions: ["modifier-groups:read"],
      },
      {
        href: "/bundles",
        labelKey: "nav.bundles",
        icon: Layers,
        permissions: ["bundles:read"],
      },
      {
        href: "/recipes",
        labelKey: "nav.recipes",
        icon: FlaskConical,
        permissions: ["recipes:read"],
      },
      {
        href: "/pricing-schedules",
        labelKey: "nav.pricingSchedules",
        icon: CalendarClock,
        permissions: ["pricing-schedules:read"],
      },
      {
        href: "/promotion-rules",
        labelKey: "nav.promotionRules",
        icon: Percent,
        permissions: ["promotion-rules:read"],
      },
      {
        href: "/uoms",
        labelKey: "nav.uoms",
        icon: Ruler,
        permissions: ["uom:read"],
      },
      {
        href: "/uom-classes",
        labelKey: "nav.uomClasses",
        icon: Ruler,
        permissions: ["uom:read"],
      },
    ],
  },
  {
    id: "staff",
    labelKey: "nav.groupStaff",
    icon: ShieldPlus,
    items: [
      {
        href: "/users",
        labelKey: "nav.users",
        icon: Users,
        permissions: ["users:read"],
      },
      {
        href: "/roles",
        labelKey: "nav.roles",
        icon: Shield,
        permissions: ["roles:read"],
      },
      {
        href: "/hostesses",
        labelKey: "nav.hostesses",
        icon: MicVocal,
        permissions: ["hospitality:hostess:read"],
      },
      {
        href: "/tip-pools",
        labelKey: "nav.tipPools",
        icon: HandCoins,
        permissions: ["tip-pools:read"],
      },
    ],
  },
  {
    id: "crm-loyalty",
    labelKey: "nav.groupCrmLoyalty",
    icon: UserRound,
    items: [
      {
        href: "/customers",
        labelKey: "nav.customers",
        icon: UserRound,
        permissions: ["customers:read"],
      },
      {
        href: "/memberships",
        labelKey: "nav.memberships",
        icon: Wallet,
        permissions: ["guestcard:wallet:read"],
      },
      {
        href: "/card-tiers",
        labelKey: "nav.membershipCardTemplates",
        icon: CreditCard,
        permissions: ["card-tiers:read", "membership-card-templates:read"],
      },
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
    ],
  },
  {
    id: "money-taxes",
    labelKey: "nav.groupMoneyTaxes",
    icon: BookText,
    items: [
      {
        href: "/payment-methods",
        labelKey: "nav.paymentMethods",
        icon: CreditCard,
        permissions: ["payment-methods:read"],
      },
      {
        href: "/tax-rates",
        labelKey: "nav.taxRates",
        icon: BadgePercent,
        permissions: ["tax-rates:read"],
      },
      {
        href: "/discount-reasons",
        labelKey: "nav.discountReasons",
        icon: Tag,
        permissions: ["discount-reasons:read"],
      },
      {
        href: "/void-reasons",
        labelKey: "nav.voidReasons",
        icon: Ban,
        permissions: ["void-reasons:read"],
      },
      {
        href: "/exchange-rates",
        labelKey: "nav.exchangeRates",
        icon: ArrowLeftRight,
        permissions: ["exchange-rates:read"],
      },
    ],
  },
  {
    id: "inventory-procurement",
    labelKey: "nav.groupInventoryProcurement",
    icon: ScrollText,
    items: [
      {
        href: "/inventory-ledger",
        labelKey: "nav.inventoryLedger",
        icon: ScrollText,
        permissions: ["inventory-ledger:read"],
      },
      {
        href: "/vendors",
        labelKey: "nav.vendors",
        icon: Truck,
        permissions: ["vendors:read"],
      },
      {
        href: "/purchase-requisitions",
        labelKey: "nav.purchaseRequisitions",
        icon: ClipboardList,
        permissions: ["purchase-requisitions:read"],
      },
      {
        href: "/purchase-orders",
        labelKey: "nav.purchaseOrders",
        icon: ShoppingBag,
        permissions: ["purchase-orders:read"],
      },
      {
        href: "/goods-received-notes",
        labelKey: "nav.goodsReceivedNotes",
        icon: ClipboardCheck,
        permissions: ["goods-received-notes:read"],
      },
      {
        href: "/transfer-orders",
        labelKey: "nav.transferOrders",
        icon: ArrowLeftRight,
        permissions: ["transfer-orders:read"],
      },
      {
        href: "/vendor-invoices",
        labelKey: "nav.vendorInvoices",
        icon: FileSpreadsheet,
        permissions: ["vendor-invoices:read"],
      },
      {
        href: "/landed-cost-allocations",
        labelKey: "nav.landedCostAllocations",
        icon: Scale,
        permissions: ["landed-cost-allocations:read"],
      },
    ],
  },
  {
    id: "more-accounting",
    labelKey: "nav.groupMoreAccounting",
    icon: BookText,
    items: [
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
        href: "/journal-entries",
        labelKey: "nav.journalEntries",
        icon: NotebookPen,
        permissions: ["journal-entries:read"],
      },
      {
        href: "/bank-statements",
        labelKey: "nav.bankStatements",
        icon: Landmark,
        permissions: ["bank-statements:read"],
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
        href: "/depreciation-schedules",
        labelKey: "nav.depreciationSchedules",
        icon: CalendarClock,
        permissions: ["depreciation-schedules:read"],
      },
    ],
  },
  {
    id: "system-administration",
    labelKey: "nav.groupSystemAdministration",
    icon: ShieldPlus,
    items: [
      {
        href: "/tenants",
        labelKey: "nav.tenants",
        icon: Building2,
        permissions: ["tenants:read"],
      },
      {
        href: "/data-transfer",
        labelKey: "nav.importExport",
        icon: FileSpreadsheet,
        permissions: ["users:read", "products:read"],
      },
      {
        href: "/uploads",
        labelKey: "nav.uploads",
        icon: Upload,
        permissions: ["uploads:read"],
      },
    ],
  },
];

/** Flat list for tabs and other consumers. */
export function getFlatSidebarMenuItems(): SidebarMenuItem[] {
  return SIDEBAR_MENU_GROUPS.flatMap((group) => group.items);
}

export function findSidebarGroupForPath(pathname: string): string | null {
  for (const group of SIDEBAR_MENU_GROUPS) {
    for (const item of group.items) {
      if (pathname === item.href || pathname.startsWith(`${item.href}/`)) {
        return group.id;
      }
    }
  }
  return null;
}
