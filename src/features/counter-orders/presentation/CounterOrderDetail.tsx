"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  ClipboardList,
  CookingPot,
  HandCoins,
  Info,
  Monitor,
  PackageCheck,
  ReceiptText,
  Ticket,
  UtensilsCrossed,
} from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { AppLoader } from "@/presentation/components/loader";
import { DataTable } from "@/presentation/components/data-table";
import {
  DetailPageHeader,
  DetailRows,
  DetailSection,
  formatDate,
  safeText,
} from "@/presentation/components/detail";
import { useToast } from "@/presentation/providers/ToastProvider";
import { getPaginatedItems } from "@/presentation/hooks/pagination";
import { useCounterOrder, usePickupCounterOrder } from "@/presentation/hooks/useCounterOrders";
import { useLocations } from "@/presentation/hooks/useLocations";
import { useDiningZones } from "@/presentation/hooks/useDiningZones";
import { useDiningTables } from "@/presentation/hooks/useDiningTables";
import { useSections } from "@/presentation/hooks/useSections";
import { useTableSessions } from "@/presentation/hooks/useTableSessions";
import { useKdsStations } from "@/presentation/hooks/useKdsStations";
import { useReservations } from "@/presentation/hooks/useReservations";
import { useWaitlist } from "@/presentation/hooks/useWaitlist";
import { useTipPools } from "@/presentation/hooks/useTipPools";
import type { CounterOrderLine } from "@/core/domain/entities/CounterOrder";
import type { CounterOrderKdsTicket } from "@/core/domain/entities/CounterOrder";
import type { KdsTicketLine } from "@/core/domain/entities/KdsTicket";

function money(n: number): string {
  return Number.isFinite(n) ? n.toFixed(2) : "—";
}

export function CounterOrderDetail({ orderId }: { orderId: string }) {
  const toast = useToast();
  const { data: order, isLoading, error } = useCounterOrder(orderId);
  const pickup = usePickupCounterOrder();

  const { data: locationsResult } = useLocations({ page: 1, limit: 200 });
  const { data: zonesResult } = useDiningZones({ page: 1, limit: 200 });
  const { data: tablesResult } = useDiningTables({ page: 1, limit: 200 });
  const { data: sectionsResult } = useSections({ page: 1, limit: 200 });
  const { data: sessionsResult } = useTableSessions({ page: 1, limit: 200 });
  const { data: stationsResult } = useKdsStations({ page: 1, limit: 200 });
  const { data: reservationsResult } = useReservations({ page: 1, limit: 200 });
  const { data: waitlistResult } = useWaitlist({ page: 1, limit: 200 });
  const { data: tipPoolsResult } = useTipPools({ page: 1, limit: 200 });

  const locations = getPaginatedItems(locationsResult);
  const zones = getPaginatedItems(zonesResult);
  const tables = getPaginatedItems(tablesResult);
  const sections = getPaginatedItems(sectionsResult);
  const sessions = getPaginatedItems(sessionsResult);
  const stations = getPaginatedItems(stationsResult);
  const reservations = reservationsResult?.items ?? [];
  const waitlistEntries = waitlistResult?.items ?? [];
  const tipPools = tipPoolsResult?.items ?? [];

  const location = useMemo(
    () => (order ? locations.find((item) => String(item.id) === order.locationId) : null),
    [locations, order],
  );

  const relatedZones = useMemo(
    () => (order ? zones.filter((zone) => zone.tenantId === order.tenantId) : []),
    [order, zones],
  );
  const relatedTables = useMemo(
    () => (order ? tables.filter((table) => table.tenantId === order.tenantId) : []),
    [order, tables],
  );
  const relatedSections = useMemo(
    () =>
      order
        ? sections.filter(
            (section) =>
              section.tenantId === order.tenantId &&
              section.locationId === order.locationId,
          )
        : [],
    [order, sections],
  );
  const relatedSessions = useMemo(
    () => (order ? sessions.filter((session) => session.tenantId === order.tenantId) : []),
    [order, sessions],
  );
  const relatedStations = useMemo(
    () =>
      order
        ? stations.filter(
            (station) =>
              station.tenantId === order.tenantId &&
              station.locationId === order.locationId,
          )
        : [],
    [order, stations],
  );
  const relatedReservations = useMemo(
    () =>
      order
        ? reservations.filter(
            (reservation) =>
              reservation.tenantId === order.tenantId &&
              reservation.locationId === order.locationId,
          )
        : [],
    [order, reservations],
  );
  const relatedWaitlist = useMemo(
    () =>
      order
        ? waitlistEntries.filter(
            (entry) =>
              entry.tenantId === order.tenantId && entry.locationId === order.locationId,
          )
        : [],
    [order, waitlistEntries],
  );
  const relatedTipPools = useMemo(
    () =>
      order
        ? tipPools.filter(
            (pool) =>
              pool.tenantId === order.tenantId && pool.locationId === order.locationId,
          )
        : [],
    [order, tipPools],
  );

  const stationLabelById = useMemo(
    () =>
      stations.reduce(
        (acc, station) => {
          acc[String(station.id)] = station.name;
          return acc;
        },
        {} as Record<string, string>,
      ),
    [stations],
  );

  const overviewRows = useMemo(
    () =>
      order
        ? [
            { label: "Order ID", value: safeText(order.id), mono: true },
            { label: "Order #", value: safeText(order.orderNumber) },
            { label: "Status", value: safeText(order.status) },
            { label: "Channel", value: safeText(order.salesChannel) },
            { label: "Location", value: location?.name || safeText(order.locationId) },
            { label: "Picked up at", value: order.pickedUpAt ? formatDate(order.pickedUpAt) : "—" },
          ]
        : [],
    [order, location],
  );

  const totalsRows = useMemo(
    () =>
      order
        ? [
            { label: "Subtotal", value: money(order.subtotal) },
            { label: "Discount", value: money(order.totalDiscount) },
            { label: "Tax", value: money(order.totalTax) },
            { label: "Grand total", value: money(order.grandTotal) },
          ]
        : [],
    [order],
  );

  const recordRows = useMemo(
    () =>
      order
        ? [
            { label: "Customer ID", value: safeText(order.customerId), mono: true },
            { label: "Created at", value: formatDate(order.createdAt ?? undefined) },
            { label: "Updated at", value: formatDate(order.updatedAt ?? undefined) },
            {
              label: "Idempotency key",
              value: order.idempotencyKey ? safeText(order.idempotencyKey) : "—",
              mono: true,
            },
          ]
        : [],
    [order],
  );

  const lineColumns = useMemo(
    () => [
      {
        key: "productName",
        header: "Product",
        render: (line: CounterOrderLine) => (
          <span className="text-foreground">{line.productName || line.variantId}</span>
        ),
      },
      {
        key: "quantity",
        header: "Qty",
        render: (line: CounterOrderLine) => <span className="text-muted">{line.quantity}</span>,
      },
      {
        key: "unitPrice",
        header: "Unit price",
        render: (line: CounterOrderLine) => <span className="text-muted">{money(line.unitPrice)}</span>,
      },
      {
        key: "status",
        header: "Line status",
        render: (line: CounterOrderLine) => <span className="text-muted">{line.status || "—"}</span>,
      },
      {
        key: "taxAmount",
        header: "Tax",
        render: (line: CounterOrderLine) => <span className="text-muted">{money(line.taxAmount)}</span>,
      },
    ],
    [],
  );

  const ticketColumns = useMemo(
    () => [
      {
        key: "ticketNumber",
        header: "Ticket #",
        render: (ticket: CounterOrderKdsTicket) => (
          <Link href={`/kds-tickets/${ticket.id}`} className="text-mint hover:underline">
            {ticket.ticketNumber}
          </Link>
        ),
      },
      {
        key: "stationId",
        header: "Station",
        render: (ticket: CounterOrderKdsTicket) => (
          <span className="text-muted">
            {stationLabelById[ticket.stationId] || ticket.stationId}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (ticket: CounterOrderKdsTicket) => <span className="text-muted">{ticket.status}</span>,
      },
      {
        key: "lines",
        header: "Lines",
        render: (ticket: CounterOrderKdsTicket) => (
          <span className="text-muted">{ticket.lines?.length ?? 0}</span>
        ),
      },
      {
        key: "firedAt",
        header: "Fired at",
        render: (ticket: CounterOrderKdsTicket) => (
          <span className="text-muted">{formatDate(ticket.firedAt ?? undefined)}</span>
        ),
      },
    ],
    [stationLabelById],
  );

  const kdsLineColumns = useMemo(
    () => [
      {
        key: "productName",
        header: "Product",
        render: (line: KdsTicketLine) => <span>{line.productName}</span>,
      },
      {
        key: "quantity",
        header: "Qty",
        render: (line: KdsTicketLine) => <span className="text-muted">{line.quantity}</span>,
      },
      {
        key: "status",
        header: "Status",
        render: (line: KdsTicketLine) => <span className="text-muted">{line.status}</span>,
      },
      {
        key: "bumpedAt",
        header: "Bumped at",
        render: (line: KdsTicketLine) => (
          <span className="text-muted">{formatDate(line.bumpedAt ?? undefined)}</span>
        ),
      },
    ],
    [],
  );

  const allKdsLines = useMemo(
    () => (order ? order.kdsTickets.flatMap((ticket) => ticket.lines ?? []) : []),
    [order],
  );

  const canPickup = !!order && !order.pickedUpAt;

  if (isLoading) return <AppLoader fullScreen={false} size="md" message="Loading counter order..." />;
  if (error || !order) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Counter order not found or failed to load.</p>
        <Link href="/counter-orders">
          <Button variant="outline">Back to Counter Orders</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DetailPageHeader
        backHref="/counter-orders"
        backLabel="Counter Orders"
        title={safeText(order.orderNumber)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DetailSection title="Order overview" icon={ReceiptText}>
          <DetailRows rows={overviewRows} />
        </DetailSection>
        <DetailSection title="Totals" icon={ClipboardList}>
          <DetailRows rows={totalsRows} />
        </DetailSection>
        <DetailSection title="Record info" icon={Info} className="lg:col-span-2">
          <DetailRows rows={recordRows} />
        </DetailSection>
      </div>

      <DetailSection title="Pickup action" icon={PackageCheck}>
        <p className="text-sm text-muted mb-3">
          Marking picked up moves READY lines to SERVED and stamps pickedUpAt on the order.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            disabled={!canPickup || pickup.isPending}
            onClick={() =>
              pickup.mutate(String(order.id), {
                onSuccess: () => toast.success("Order marked as picked up."),
                onError: () => toast.error("Failed to mark order as picked up."),
              })
            }
          >
            {pickup.isPending ? "Updating..." : "Mark picked up"}
          </Button>
          {order.pickedUpAt ? (
            <span className="text-sm text-muted self-center">
              Picked up {formatDate(order.pickedUpAt)}
            </span>
          ) : null}
        </div>
      </DetailSection>

      <DetailSection title="Order lines" icon={ClipboardList}>
        <DataTable
          data={order.lines}
          columns={lineColumns}
          actions={[]}
          emptyText="No order lines."
        />
      </DetailSection>

      <DetailSection title="KDS tickets" icon={Ticket}>
        <DataTable
          data={order.kdsTickets}
          columns={ticketColumns}
          actions={[]}
          emptyText="No KDS tickets fired for this order."
        />
      </DetailSection>

      {allKdsLines.length > 0 ? (
        <DetailSection title="KDS ticket lines" icon={CookingPot}>
          <DataTable
            data={allKdsLines}
            columns={kdsLineColumns}
            actions={[]}
            emptyText="No KDS lines."
          />
        </DetailSection>
      ) : null}

      <DetailSection title="Location context" icon={Monitor}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-md border border-border p-3">
            <p className="text-xs text-muted">Dining zones</p>
            <p className="text-lg font-semibold">{relatedZones.length}</p>
            <Link href="/dining-zones" className="text-xs text-mint hover:underline">
              View dining zones
            </Link>
          </div>
          <div className="rounded-md border border-border p-3">
            <p className="text-xs text-muted">Dining tables</p>
            <p className="text-lg font-semibold">{relatedTables.length}</p>
            <Link href="/dining-tables" className="text-xs text-mint hover:underline">
              View dining tables
            </Link>
          </div>
          <div className="rounded-md border border-border p-3">
            <p className="text-xs text-muted">Table sessions</p>
            <p className="text-lg font-semibold">{relatedSessions.length}</p>
            <Link href="/table-sessions" className="text-xs text-mint hover:underline">
              View table sessions
            </Link>
          </div>
          <div className="rounded-md border border-border p-3">
            <p className="text-xs text-muted">Sections</p>
            <p className="text-lg font-semibold">{relatedSections.length}</p>
            <Link href="/sections" className="text-xs text-mint hover:underline">
              View sections
            </Link>
          </div>
        </div>
      </DetailSection>

      <DetailSection title="Operations linkage" icon={UtensilsCrossed}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-md border border-border p-3">
            <p className="text-xs text-muted">KDS stations</p>
            <p className="text-lg font-semibold">{relatedStations.length}</p>
            <Link href="/kds-stations" className="text-xs text-mint hover:underline">
              View KDS stations
            </Link>
          </div>
          <div className="rounded-md border border-border p-3">
            <p className="text-xs text-muted">KDS tickets on order</p>
            <p className="text-lg font-semibold">{order.kdsTickets.length}</p>
            <Link href="/kds-tickets" className="text-xs text-mint hover:underline">
              View all KDS tickets
            </Link>
          </div>
          <div className="rounded-md border border-border p-3">
            <p className="text-xs text-muted">Reservations</p>
            <p className="text-lg font-semibold">{relatedReservations.length}</p>
            <Link href="/reservations" className="text-xs text-mint hover:underline">
              View reservations
            </Link>
          </div>
          <div className="rounded-md border border-border p-3">
            <p className="text-xs text-muted">Waitlist</p>
            <p className="text-lg font-semibold">{relatedWaitlist.length}</p>
            <Link href="/waitlist" className="text-xs text-mint hover:underline">
              View waitlist
            </Link>
          </div>
        </div>
      </DetailSection>

      <DetailSection title="Tip pools" icon={HandCoins}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-md border border-border p-3">
            <p className="text-xs text-muted">Tip pools at location</p>
            <p className="text-lg font-semibold">{relatedTipPools.length}</p>
            <Link href="/tip-pools" className="text-xs text-mint hover:underline">
              View tip pools
            </Link>
          </div>
          <div className="rounded-md border border-border p-3">
            <p className="text-xs text-muted">Sales order</p>
            <p className="text-lg font-semibold truncate">{order.orderNumber}</p>
            <Link href={`/sales-orders/${order.id}`} className="text-xs text-mint hover:underline">
              View sales order
            </Link>
          </div>
        </div>
      </DetailSection>
    </div>
  );
}
