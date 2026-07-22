"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/presentation/providers/CurrencyProvider";
import { ProductCardImage } from "@/presentation/components/product/ProductCardImage";

export interface PosCartItemData {
  id: string;
  name: string;
  sku: string;
  imageUrl?: string | null;
  quantity: number;
  totalPrice: number;
}

export interface PosCartItemProps {
  item: PosCartItemData;
  className?: string;
  quantityLabel?: string;
  formatPrice?: (value: number) => string;
  onIncrement: (item: PosCartItemData) => void;
  onDecrement: (item: PosCartItemData) => void;
  onDelete: (item: PosCartItemData) => void;
}

export function PosCartItem({
  item,
  className,
  quantityLabel = "Quantity",
  formatPrice,
  onIncrement,
  onDecrement,
  onDelete,
}: PosCartItemProps) {
  const { formatPrice: formatCurrencyPrice } = useCurrency();
  const resolvedFormatPrice = formatPrice ?? formatCurrencyPrice;
  const handleDecrement: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    event.stopPropagation();
    onDecrement(item);
  };

  const handleIncrement: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    event.stopPropagation();
    onIncrement(item);
  };

  const handleDelete: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    event.stopPropagation();
    onDelete(item);
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-3 py-3",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-border bg-muted/20">
          <ProductCardImage
            src={item.imageUrl}
            alt={item.name}
            sizes="48px"
            imageClassName="object-cover"
            logoClassName="w-7"
          />
        </div>

        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-foreground">
            {item.name}
          </div>
          <div className="mt-1 truncate text-xs text-muted">{item.sku}</div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <div
          className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 dark:bg-white/10"
          aria-label={quantityLabel}
        >
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-full"
            onClick={handleDecrement}
            aria-label={`Decrease quantity for ${item.name}`}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-8 text-center text-sm font-semibold tabular-nums text-foreground">
            {item.quantity}
          </span>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-full"
            onClick={handleIncrement}
            aria-label={`Increase quantity for ${item.name}`}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="min-w-[96px] text-right text-base font-bold tabular-nums text-foreground">
          {resolvedFormatPrice(item.totalPrice)}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full text-muted hover:text-red-600 dark:hover:text-red-400"
          onClick={handleDelete}
          aria-label={`Remove ${item.name}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
