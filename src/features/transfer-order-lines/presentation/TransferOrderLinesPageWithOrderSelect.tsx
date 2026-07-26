"use client";

import { useMemo, useState } from "react";
import { Label } from "@/presentation/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { useTransferOrders } from "@/presentation/hooks/useTransferOrders";
import { getPaginatedItems } from "@/presentation/hooks/pagination";
import { TransferOrderLineList } from "./TransferOrderLineList";

const ORDER_LIST_LIMIT = 200;

export function TransferOrderLinesPageWithOrderSelect() {
  const { data: ordersData, isLoading } = useTransferOrders({
    page: 1,
    limit: ORDER_LIST_LIMIT,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const orders = getPaginatedItems(ordersData);
  const [selectedId, setSelectedId] = useState<string>("");

  const sorted = useMemo(
    () =>
      [...orders].sort((a, b) =>
        (b.createdAt ?? "").localeCompare(a.createdAt ?? "")
      ),
    [orders]
  );

  return (
    <div className="space-y-6">
      <div className="grid max-w-md gap-2">
        <Label htmlFor="transfer-order-select">Transfer order</Label>
        <Select value={selectedId} onValueChange={setSelectedId} disabled={isLoading}>
          <SelectTrigger id="transfer-order-select">
            <SelectValue
              placeholder={isLoading ? "Loading transfer orders..." : "Select transfer order"}
            />
          </SelectTrigger>
          <SelectContent>
            {sorted.map((o) => (
              <SelectItem key={o.id} value={String(o.id)}>
                {o.transferNumber} — {o.status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedId ? (
        <TransferOrderLineList transferOrderId={selectedId} />
      ) : (
        <p className="text-sm text-muted">
          Select a transfer order to view and manage its lines.
        </p>
      )}
    </div>
  );
}
