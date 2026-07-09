"use client";

import {
  Bike,
  CarFront,
  ChefHat,
  Gift,
  Percent,
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
  orderNumber?: string | null;
  tableNumber: string;
  staffName: string;
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
  onPrint: () => void;
  onPrimaryAction: () => void;
  primaryActionLabel?: string;
  primaryActionDisabled?: boolean;
  printDisabled?: boolean;
  className?: string;
}

function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`;
}

export function PosRightSidebarCart({
  orderNumber,
  tableNumber,
  staffName,
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
  onPrint,
  onPrimaryAction,
  primaryActionLabel = "Pay Now",
  primaryActionDisabled = false,
  printDisabled = false,
  className,
}: PosRightSidebarCartProps) {
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
  const orderTypeLabel =
    orderType === "dine-in"
      ? "Dine In"
      : orderType === "takeout"
        ? "Takeout"
        : orderType === "curbside"
          ? "Curbside"
          : orderType === "delivery"
            ? "Delivery"
            : orderType === "drive-thru"
              ? "Drive-Thru"
              : "Catering";

  return (
    <section
      data-print-receipt
      className={cn(
        "visible-scrollbar flex h-[calc(100vh-110px)] min-h-0 flex-col overflow-y-auto rounded-2xl border border-gray-200 bg-white p-4 shadow-[0_20px_50px_-28px_rgba(15,23,42,0.28)] print:h-auto print:min-h-0 print:overflow-visible print:rounded-none print:border-0 print:bg-white print:p-0 print:shadow-none dark:border-border dark:bg-background",
        className,
      )}
    >
      <div className="shrink-0 space-y-3 print:space-y-2">
        <div className="hidden print:block">
          <p className="text-center text-lg font-bold text-black">Order Slip</p>
          <p className="mt-1 text-center text-xs uppercase tracking-[0.24em] text-slate-500">
            Vision AI POS
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

        <div className="grid grid-cols-2 gap-2.5 print:gap-2">
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

      <div className="my-4 flex min-w-0 flex-col rounded-2xl border border-slate-100 bg-slate-50/50 print:my-3 print:rounded-none print:border-x-0 print:border-t-0 print:border-b-slate-300 print:bg-transparent dark:border-border dark:bg-white/5">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 print:px-0 dark:border-border">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-slate-400">
              Selected Items
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
                      <div className="flex items-start gap-3">
                        <div className="inline-flex min-w-9 shrink-0 justify-center rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold tabular-nums text-slate-700 dark:bg-white/10 dark:text-foreground">
                          {item.quantity}x
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <p className="line-clamp-2 min-w-0 flex-1 text-sm font-semibold leading-snug text-slate-900 dark:text-foreground">
                              {item.name}
                            </p>
                            <div className="shrink-0 text-right text-sm font-semibold tabular-nums text-slate-900 dark:text-foreground">
                              {formatCurrency(item.price)}
                            </div>
                          </div>
                          {item.modifier ? (
                            <p className="mt-1 truncate text-xs text-slate-400">
                              {item.modifier}
                            </p>
                          ) : null}
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

      <div className="shrink-0 border-t border-gray-100 bg-white pt-4 print:border-t-0 print:bg-white print:pt-0 dark:border-border dark:bg-background">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-border dark:bg-white/5">
          <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-400">
            Order Type
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 dark:bg-mint/10 dark:text-mint">
              {orderTypeLabel}
            </span>
            {orderType === "curbside" ? (
              <span className="text-xs font-medium text-slate-400">
                Service note $0.00
              </span>
            ) : null}
          </div>
        </div>
        <div className="space-y-2.5 print:rounded-none print:border-t print:border-slate-300 print:pt-3">
          <SummaryRow label="Sub Total" value={summary.subtotal} />
          <SummaryRow label="Discount" value={summary.discount} />
          <SummaryRow label="Service Charge" value={summary.serviceCharge} />
          <SummaryRow label="Tax" value={summary.tax} />
        </div>
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-3 print:hidden dark:border-border dark:bg-white/5">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-400">
                Offers
              </p>
              <p className="mt-1 text-sm text-slate-600 dark:text-muted">
                Add a gift code or promotion before payment.
              </p>
            </div>
            <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-500 shadow-sm dark:bg-background dark:text-muted">
              Optional
            </span>
          </div>
          <div className="space-y-2.5">
            <OfferInput
              icon={Gift}
              label="Gift Code"
              placeholder="Enter gift code"
              value={giftCode}
              onChange={onGiftCodeChange}
            />
            <OfferInput
              icon={Percent}
              label="Promotion"
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
              <p className="rounded-xl bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm dark:bg-background dark:text-muted">
                {promotionMeta}
              </p>
            ) : (
              <p className="text-xs text-slate-400">
                Suggestions come from your Promotion Rules page.
              </p>
            )}
          </div>
        </div>
        <div className="mt-4 flex items-end justify-between gap-3 border-t border-gray-100 pt-4 dark:border-border">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-slate-400">
              Total
            </p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-slate-950 dark:text-foreground">
              {formatCurrency(summary.total)}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 print:hidden">
          <Button
            type="button"
            variant="outline"
            onClick={onPrint}
            disabled={printDisabled}
            className="h-12 rounded-2xl border-gray-200 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:border-border dark:bg-background"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button
            type="button"
            onClick={onPrimaryAction}
            disabled={primaryActionDisabled}
            className="h-12 rounded-2xl bg-mint text-white hover:bg-mint-hover dark:text-gloss-black"
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
    <div className="relative rounded-2xl bg-slate-100 p-1 dark:bg-white/5">
      <div className="scrollbar-hide overflow-x-auto scroll-smooth">
        <div className="flex min-w-max gap-1.5 pr-10">
          {options.map((option) => {
            const Icon = option.icon;
            const isActive = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange(option.value)}
                className={cn(
                  "flex min-h-12 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all",
                  isActive
                    ? "border-green-200 bg-green-50 text-green-800 shadow-sm dark:border-mint/20 dark:bg-mint/10 dark:text-mint"
                    : "border-transparent bg-white/70 text-slate-500 hover:bg-white hover:text-slate-900 dark:bg-transparent dark:text-muted dark:hover:bg-white/10 dark:hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="whitespace-nowrap">{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="pointer-events-none absolute inset-y-1 right-1 w-12 rounded-r-2xl bg-gradient-to-l from-slate-100 via-slate-100/90 to-transparent dark:from-[#252324] dark:via-[#252324]/88" />
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
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-slate-400 print:text-slate-700">{label}</span>
      <span className="font-medium tabular-nums text-slate-600 print:text-black dark:text-muted">
        {formatCurrency(value)}
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
