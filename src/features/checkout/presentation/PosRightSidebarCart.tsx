"use client";

import type { ReactNode } from "react";
import {
  Bike,
  CarFront,
  ChefHat,
  Gift,
  Minus,
  Percent,
  Plus,
  Printer,
  ReceiptText,
  ShoppingBag,
  Truck,
  UtensilsCrossed,
} from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/presentation/providers/CurrencyProvider";
import type { TenantCurrency } from "@/core/domain/entities/Tenant";
import type { ThermalPaperWidth, ThermalPrintMode } from "@/core/domain/entities/ThermalPrint";
import { usePrinterPreferences } from "@/presentation/hooks/usePrinterPreferences";

export type PosOrderType =
  | "dine-in"
  | "takeout"
  | "curbside"
  | "delivery"
  | "drive-thru"
  | "catering";

export interface PosSidebarCartItem {
  id: string;
  category: string;
  name: string;
  modifier?: string;
  quantity: number;
  price: number;
}

export interface PosSidebarSummary {
  subtotal: number;
  discount: number;
  serviceCharge: number;
  tax: number;
  total: number;
}

export interface PromotionOption {
  id: string;
  label: string;
}

export interface PosRightSidebarCartProps {
  currency: TenantCurrency;
  orderNumber?: string | null;
  tableNumber: string;
  orderType: PosOrderType;
  tableOptions: string[];
  items: PosSidebarCartItem[];
  giftCode: string;
  promotionCode: string;
  promotionOptions: PromotionOption[];
  promotionMeta?: string | null;
  summary: PosSidebarSummary;
  onOrderTypeChange: (value: PosOrderType) => void;
  onTableNumberChange: (value: string) => void;
  onGiftCodeChange: (value: string) => void;
  onPromotionCodeChange: (value: string) => void;
  onQuantityChange: (itemId: string, change: 1 | -1) => void;
  onPrint: (options: {
    mode: ThermalPrintMode;
    paperWidthMm: ThermalPaperWidth;
  }) => void;
  onPrimaryAction: () => void;
  primaryActionLabel?: string;
  primaryActionDisabled?: boolean;
  printDisabled?: boolean;
  isPrinting?: boolean;
  className?: string;
  /** Payments and the like, scrolled with the items above the pinned total. */
  children?: ReactNode;
}

export function PosRightSidebarCart({
  currency,
  orderNumber,
  tableNumber,
  orderType,
  tableOptions,
  items,
  giftCode,
  promotionCode,
  promotionOptions,
  promotionMeta,
  summary,
  onOrderTypeChange,
  onTableNumberChange,
  onGiftCodeChange,
  onPromotionCodeChange,
  onQuantityChange,
  onPrint,
  onPrimaryAction,
  primaryActionLabel = "Pay Now",
  primaryActionDisabled = false,
  printDisabled = false,
  isPrinting = false,
  className,
  children,
}: PosRightSidebarCartProps) {
  const { formatPrice: formatCurrencyPrice } = useCurrency();
  const formatPrice = (value: number) => formatCurrencyPrice(value, currency);
  const { preferences } = usePrinterPreferences();
  const { mode: printMode, paperWidthMm } = preferences.receipt;
  const normalizedOrderNumber = orderNumber?.trim();
  const orderDisplayValue = normalizedOrderNumber
    ? `Order #${normalizedOrderNumber}`
    : "New Order";
  const groupedItems = items.reduce<Record<string, PosSidebarCartItem[]>>(
    (accumulator, item) => {
      const key = item.category || "Uncategorized";
      if (!accumulator[key]) {
        accumulator[key] = [];
      }
      accumulator[key].push(item);
      return accumulator;
    },
    {},
  );

  const categoryEntries = Object.entries(groupedItems);
  const totalItems = items.reduce(
    (accumulator, item) => accumulator + Math.max(item.quantity, 0),
    0,
  );
  return (
    <section
      data-print-receipt
      className={cn(
        "flex h-full min-h-0 flex-col rounded-2xl border border-gray-200 bg-white p-4 shadow-[0_20px_50px_-28px_rgba(15,23,42,0.28)] print:h-auto print:min-h-0 print:overflow-visible print:rounded-none print:border-0 print:bg-white print:p-0 print:shadow-none dark:border-border dark:bg-background",
        className,
      )}
    >
      <div className="shrink-0 space-y-3 print:space-y-2">
        <div className="hidden print:block">
          <p className="text-center text-xl font-black uppercase text-black">
            Kitchen Order
          </p>
          <p className="mt-1 text-center text-xs font-black uppercase tracking-[0.24em] text-black">
            Prepare before payment
          </p>
        </div>

        <div className="print:hidden">
        <OrderTypeTabs value={orderType} onChange={onOrderTypeChange} />
        </div>

        <div
          className={cn(
            "overflow-hidden transition-all duration-200 print:max-h-none print:opacity-100",
            orderType === "dine-in"
              ? "max-h-28 opacity-100"
              : "max-h-0 opacity-0",
          )}
        >
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3 print:rounded-none print:border-x-0 print:border-t-0 print:border-b-slate-300 print:bg-transparent print:px-0 dark:border-border dark:bg-white/5">
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-slate-500 dark:text-muted">
              Table Assignment
            </p>
            <div className="mt-2 print:hidden">
              <Select value={tableNumber} onValueChange={onTableNumberChange}>
                <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white shadow-sm dark:border-border dark:bg-background">
                  <SelectValue placeholder="Select table" />
                </SelectTrigger>
                <SelectContent>
                  {tableOptions.length === 0 ? (
                <p className="text-xs text-slate-400">No tables set up for this shop.</p>
              ) : null}
              {tableOptions.map((table) => (
                    <SelectItem key={table} value={table}>
                      {table}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="mt-2 hidden text-sm font-semibold text-black print:block">
              {orderType === "dine-in" ? tableNumber : "Not assigned"}
            </p>
          </div>
        </div>

        <div className="hidden grid-cols-2 gap-2.5 print:grid print:gap-2">
          <InfoTile
            label="Order"
            value={orderDisplayValue}
            valueClassName="font-bold break-all"
          />
          <InfoTile
            label="Table"
            value={orderType === "dine-in" ? tableNumber : "Not assigned"}
          />
        </div>
      </div>

      <div className="visible-scrollbar my-4 min-h-0 flex-1 space-y-4 overflow-y-auto pr-1 print:my-3 print:overflow-visible">
        <div className="flex min-w-0 flex-col rounded-2xl border border-slate-100 bg-slate-50/50 print:my-3 print:rounded-none print:border-x-0 print:border-t-0 print:border-b-slate-300 print:bg-transparent dark:border-border dark:bg-white/5">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 print:px-0 dark:border-border">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-slate-400">
                Kitchen Items
              </p>
              <p className="mt-1 text-sm font-medium text-slate-700 dark:text-foreground">
                {totalItems > 0
                  ? `${totalItems} item${totalItems > 1 ? "s" : ""} in cart`
                  : "No products added yet"}
              </p>
            </div>
            {totalItems > 0 ? (
              <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 dark:bg-mint/10 dark:text-mint">
                {totalItems}
              </span>
            ) : null}
          </div>

          <div className="space-y-2 px-3 py-3 print:px-0">
          {categoryEntries.length === 0 ? (
            <div className="flex h-full min-h-56 flex-col items-center justify-center rounded-[22px] border border-dashed border-gray-200 bg-white/80 px-5 text-center dark:border-border dark:bg-background/60">
              <ReceiptText className="mb-3 h-8 w-8 text-slate-400" />
              <p className="text-sm font-medium text-slate-700 dark:text-foreground">
                No items in this order yet
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Add products from the menu to populate the cart.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {categoryEntries.map(([category, categoryItems]) => (
                <div key={category} className="space-y-3">
                  <div className="inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-mint/10 dark:text-mint">
                    {category}
                  </div>
                  <div className="space-y-2">
                    {categoryItems.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-sm print:rounded-none print:border-x-0 print:border-t-0 print:border-b-slate-200 print:bg-transparent print:px-0 print:shadow-none dark:border-border dark:bg-background"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900 dark:text-foreground">
                              {item.name}
                            </p>
                            {item.modifier ? (
                              <p className="mt-1 truncate text-xs text-slate-400">
                                {item.modifier}
                              </p>
                            ) : null}
                          </div>
                          <div className="flex shrink-0 flex-col items-end gap-2">
                            <div className="text-right text-sm font-semibold tabular-nums text-slate-900 dark:text-foreground">
                              {formatPrice(item.price)}
                            </div>
                            <div className="flex items-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50 shadow-sm dark:border-border dark:bg-white/5">
                              <button
                                type="button"
                                onClick={() => onQuantityChange(item.id, -1)}
                                className="flex h-8 w-8 items-center justify-center text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint dark:text-muted dark:hover:bg-red-500/10 dark:hover:text-red-400"
                                aria-label={`Decrease quantity for ${item.name}`}
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="flex h-8 min-w-8 items-center justify-center border-x border-slate-200 bg-white px-1 text-xs font-semibold tabular-nums text-slate-700 dark:border-border dark:bg-background dark:text-foreground">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => onQuantityChange(item.id, 1)}
                                className="flex h-8 w-8 items-center justify-center text-slate-600 transition-colors hover:bg-mint/10 hover:text-mint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint dark:text-muted"
                                aria-label={`Increase quantity for ${item.name}`}
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2.5 print:hidden sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-2">
          <OfferInput
            icon={Gift}
            label="Gift code"
            placeholder="Enter gift code"
            value={giftCode}
            onChange={onGiftCodeChange}
          />
          <OfferInput
            icon={Percent}
            label="Promotion code"
            placeholder="Enter promotion code"
            value={promotionCode}
            onChange={onPromotionCodeChange}
            listId="promotion-rule-options"
          />
          {promotionOptions.length > 0 ? (
            <datalist id="promotion-rule-options">
              {promotionOptions.map((option) => (
                <option key={option.id} value={option.label} />
              ))}
            </datalist>
          ) : null}
          {promotionMeta ? (
            <p className="text-xs font-medium text-slate-600 dark:text-muted sm:col-span-2 md:col-span-1 xl:col-span-2">
              {promotionMeta}
            </p>
          ) : null}
        </div>

        {children ? <div className="space-y-4 print:hidden">{children}</div> : null}
      </div>

      <div className="shrink-0 space-y-3 border-t border-gray-100 pt-3 print:hidden dark:border-border">
        <div className="space-y-1.5">
          <SummaryRow label="Sub Total" value={summary.subtotal} formatPrice={formatPrice} />
          {summary.discount ? (
            <SummaryRow label="Discount" value={summary.discount} formatPrice={formatPrice} />
          ) : null}
          {summary.serviceCharge ? (
            <SummaryRow label="Service Charge" value={summary.serviceCharge} formatPrice={formatPrice} />
          ) : null}
          <SummaryRow label="Tax" value={summary.tax} formatPrice={formatPrice} />
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-sm font-semibold text-slate-500 dark:text-muted">Total</span>
          <span className="text-2xl font-bold tracking-tight tabular-nums text-slate-950 dark:text-foreground">
            {formatPrice(summary.total)}
          </span>
        </div>
        <div className="grid grid-cols-[auto_1fr] gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onPrint({ mode: printMode, paperWidthMm })}
            disabled={printDisabled}
            className="h-12 rounded-2xl"
            aria-label="Print order slip"
            title="Print order slip"
          >
            <Printer className="h-4 w-4" />
            {isPrinting ? "Printing..." : "Print"}
          </Button>
          <Button
            type="button"
            onClick={onPrimaryAction}
            disabled={primaryActionDisabled}
            className="h-12 rounded-2xl bg-mint text-base font-semibold text-white hover:bg-mint-hover dark:text-gloss-black"
          >
            {primaryActionLabel}
          </Button>
        </div>
      </div>
    </section>
  );
}

function OrderTypeTabs({
  value,
  onChange,
}: {
  value: PosOrderType;
  onChange: (value: PosOrderType) => void;
}) {
  const options: Array<{
    value: PosOrderType;
    label: string;
    icon: typeof UtensilsCrossed;
  }> = [
    { value: "dine-in", label: "Dine In", icon: UtensilsCrossed },
    { value: "takeout", label: "Takeout", icon: ShoppingBag },
    { value: "curbside", label: "Curbside", icon: CarFront },
    { value: "delivery", label: "Delivery", icon: Truck },
    { value: "drive-thru", label: "Drive-Thru", icon: Bike },
    { value: "catering", label: "Catering", icon: ChefHat },
  ];

  return (
    <div className="grid grid-cols-3 gap-1 rounded-2xl bg-slate-100 p-1 dark:bg-white/5">
      {options.map((option) => {
        const Icon = option.icon;
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "flex min-h-10 min-w-0 items-center justify-center gap-1.5 rounded-xl border px-2 py-1.5 text-xs font-semibold transition-all",
              isActive
                ? "border-green-200 bg-green-50 text-green-800 shadow-sm dark:border-mint/20 dark:bg-mint/10 dark:text-mint"
                : "border-transparent bg-white/70 text-slate-500 hover:bg-white hover:text-slate-900 dark:bg-transparent dark:text-muted dark:hover:bg-white/10 dark:hover:text-foreground",
            )}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function InfoTile({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="min-h-[72px] min-w-0 rounded-xl bg-slate-50 px-3 py-2.5 print:min-h-0 print:rounded-none print:bg-transparent print:px-0 dark:bg-white/5">
      <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-slate-400">
        {label}
      </p>
      <p
        className={cn(
          "mt-1.5 text-[15px] font-medium text-slate-800 print:text-black dark:text-foreground",
          valueClassName,
        )}
      >
        {value}
      </p>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  formatPrice,
}: {
  label: string;
  value: number;
  formatPrice: (value: number) => string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-slate-400 print:text-slate-700">{label}</span>
      <span className="font-medium tabular-nums text-slate-600 print:text-black dark:text-muted">
        {formatPrice(value)}
      </span>
    </div>
  );
}

function OfferInput({
  icon: Icon,
  label,
  placeholder,
  value,
  onChange,
  listId,
}: {
  icon: typeof Gift;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  listId?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-muted">
        {label}
      </span>
      <div className="group flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm transition-all focus-within:border-mint/60 focus-within:ring-2 focus-within:ring-mint/10 dark:border-border dark:bg-background">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-700 transition-colors group-focus-within:bg-mint/10 group-focus-within:text-mint dark:bg-mint/10 dark:text-mint">
          <Icon className="h-4 w-4" />
        </div>
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          list={listId}
          className="h-auto border-0 bg-transparent px-0 py-0 text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>
    </label>
  );
}
