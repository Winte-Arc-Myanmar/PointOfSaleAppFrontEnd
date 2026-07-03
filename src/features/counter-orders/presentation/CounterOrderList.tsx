"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import type { SalesOrder } from "@/core/domain/entities/SalesOrder";
import { useLocations } from "@/presentation/hooks/useLocations";
import { useSalesOrders } from "@/presentation/hooks/useSalesOrders";
import { usePagination } from "@/presentation/hooks/usePagination";
import { getPaginatedItems } from "@/presentation/hooks/pagination";
import { useToast } from "@/presentation/providers/ToastProvider";
import { usePickupCounterOrder } from "@/presentation/hooks/useCounterOrders";
import { getCounterOrderRowActions } from "./counter-order-row-actions";
import { getCounterOrderTableColumns } from "./counter-order-table-columns";

const PAGE_SIZE = 20;
const ALL = "ALL";

export function CounterOrderList() {
  const router = useRouter();
  const toast = useToast();
  const pagination = usePagination({ pageSize: PAGE_SIZE });
  const pickup = usePickupCounterOrder();

  const [statusFilter, setStatusFilter] = useState(ALL);
  const [locationFilter, setLocationFilter] = useState(ALL);
  const [lookupId, setLookupId] = useState("");

  const { data: locationsResult } = useLocations({ page: 1, limit: 200 });
  const locations = getPaginatedItems(locationsResult);
  const locationLabelById = useMemo(
    () =>
      locations.reduce(
        (acc, location) => {
          acc[String(location.id)] = location.name;
          return acc;
        },
        {} as Record<string, string>,
      ),
    [locations],
  );

  const { data: ordersResult, isLoading, error, refetch } = useSalesOrders({
    page: pagination.page,
    limit: PAGE_SIZE,
    sortBy: "createdAt",
    sortOrder: "desc",
    status: statusFilter !== ALL ? statusFilter : undefined,
  });
  const orders = ordersResult?.items ?? [];

  const filteredOrders = useMemo(() => {
    if (locationFilter === ALL) return orders;
    return orders.filter((order) => String(order.locationId) === locationFilter);
  }, [orders, locationFilter]);

  const actions = useMemo(
    () =>
      getCounterOrderRowActions({
        onView: (order) => router.push(`/counter-orders/${order.id}`),
        onPickup: (order) =>
          pickup.mutate(String(order.id), {
            onSuccess: () => toast.success("Order marked as picked up."),
            onError: () => toast.error("Failed to mark order as picked up."),
          }),
      }),
    [router, pickup, toast],
  );

  const columns = useMemo(
    () =>
      getCounterOrderTableColumns({
        onView: (order) => router.push(`/counter-orders/${order.id}`),
        locationLabelById,
      }),
    [router, locationLabelById],
  );

  return (
    <EntityListWithCreateModal<SalesOrder>
      data={filteredOrders}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      loadingText="Loading counter orders..."
      emptyText="No counter orders found."
      createEnabled={false}
      topContent={
        <div className="mb-4 space-y-4">
          <div className="rounded-md border border-border p-4">
            <Label htmlFor="counter-order-lookup" className="text-sm font-medium">
              Open by order ID
            </Label>
            <p className="text-xs text-muted mb-2">
              Counter orders use the sales order ID. Enter an ID to open the full order with lines and KDS tickets.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                id="counter-order-lookup"
                value={lookupId}
                onChange={(e) => setLookupId(e.target.value)}
                placeholder="Sales order UUID"
                className="sm:flex-1"
              />
              <Button
                type="button"
                variant="secondary"
                disabled={!lookupId.trim()}
                onClick={() => router.push(`/counter-orders/${lookupId.trim()}`)}
              >
                <Search className="h-4 w-4 mr-2" />
                Open order
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="grid gap-2">
              <label className="text-xs text-muted">Status</label>
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value);
                  pagination.reset(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>All statuses</SelectItem>
                  <SelectItem value="DRAFT">DRAFT</SelectItem>
                  <SelectItem value="CONFIRMED">CONFIRMED</SelectItem>
                  <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                  <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <label className="text-xs text-muted">Location</label>
              <Select
                value={locationFilter}
                onValueChange={(value) => {
                  setLocationFilter(value);
                  pagination.reset(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>All locations</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={String(location.id)}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      }
      error={
        error
          ? {
              message: "Failed to load counter orders.",
              onRetry: () => refetch(),
            }
          : undefined
      }
      pageSize={PAGE_SIZE}
      currentPage={pagination.page}
      totalPages={ordersResult?.totalPages ?? pagination.getTotalPages(ordersResult?.total)}
      totalItems={ordersResult?.total ?? 0}
      onPageChange={pagination.setPage}
    />
  );
}
