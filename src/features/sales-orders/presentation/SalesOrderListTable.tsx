"use client";

import type { SalesOrder } from "@/core/domain/entities/SalesOrder";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/presentation/components/ui/table";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import { orderStatusLabel } from "./order-status";

function formatDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function channelLabel(channel?: string | null): string {
  if (channel === "POS") return "In store";
  if (channel === "ONLINE") return "Delivery";
  if (channel === "PHONE") return "Takeaway";
  return channel || "—";
}

export function SalesOrderListTable({
  orders,
  selectable,
  selected,
  onToggle,
  onToggleAll,
  onOpen,
}: {
  orders: SalesOrder[];
  selectable: boolean;
  selected: Set<string>;
  onToggle: (id: string) => void;
  onToggleAll: (checked: boolean) => void;
  onOpen: (order: SalesOrder) => void;
}) {
  const allSelected =
    orders.length > 0 && orders.every((o) => selected.has(String(o.id)));
  const someSelected = orders.some((o) => selected.has(String(o.id)));

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-[var(--shadow-panel)]">
      <Table>
        <TableHeader>
          <TableRow>
            {selectable ? (
              <TableHead className="w-10">
                <input
                  type="checkbox"
                  aria-label="Select all orders on this page"
                  className="h-4 w-4 accent-emerald-500"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected && !allSelected;
                  }}
                  onChange={(e) => onToggleAll(e.target.checked)}
                />
              </TableHead>
            ) : null}
            <TableHead>Order #</TableHead>
            <TableHead className="hidden md:table-cell">Date</TableHead>
            <TableHead className="hidden md:table-cell">Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            const id = String(order.id);
            const isSelected = selected.has(id);
            return (
              <TableRow
                key={id}
                onClick={() => onOpen(order)}
                className={cn(
                  "cursor-pointer",
                  isSelected && "bg-emerald-50/70 dark:bg-mint/10",
                )}
              >
                {selectable ? (
                  <TableCell
                    className="w-10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      aria-label={`Select order ${order.orderNumber}`}
                      className="h-4 w-4 accent-emerald-500"
                      checked={isSelected}
                      onChange={() => onToggle(id)}
                    />
                  </TableCell>
                ) : null}
                <TableCell className="font-medium text-foreground">
                  {order.orderNumber || "—"}
                </TableCell>
                <TableCell className="hidden whitespace-nowrap text-muted md:table-cell">
                  {formatDate(order.createdAt)}
                </TableCell>
                <TableCell className="hidden text-muted md:table-cell">
                  {channelLabel(order.salesChannel)}
                </TableCell>
                <TableCell>{orderStatusLabel(order.status)}</TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  {formatMoney(order.grandTotal)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
