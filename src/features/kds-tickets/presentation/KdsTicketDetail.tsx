"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ClipboardList, CookingPot, Info, Monitor, Timer, UtensilsCrossed } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { AppLoader } from "@/presentation/components/loader";
import {
  DetailPageHeader,
  DetailRows,
  DetailSection,
  formatDate,
  safeText,
} from "@/presentation/components/detail";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useKdsStations } from "@/presentation/hooks/useKdsStations";
import { useTableSession, useTableSessions } from "@/presentation/hooks/useTableSessions";
import { useDiningTables } from "@/presentation/hooks/useDiningTables";
import { useDiningZones } from "@/presentation/hooks/useDiningZones";
import { useSections } from "@/presentation/hooks/useSections";
import { useSalesOrder } from "@/presentation/hooks/useSalesOrders";
import { getPaginatedItems } from "@/presentation/hooks/pagination";
import {
  useExpediteKdsTicket,
  useKdsTicket,
  useReadyKdsTicket,
  useReadyKdsTicketLine,
  useRecallKdsTicket,
  useStartKdsTicket,
} from "@/presentation/hooks/useKdsTickets";

export function KdsTicketDetail({ ticketId }: { ticketId: string }) {
  const toast = useToast();
  const { data: ticket, isLoading, error } = useKdsTicket(ticketId);

  const { data: stationsResult } = useKdsStations({ page: 1, limit: 200, sortBy: "name", sortOrder: "asc" });
  const stations = getPaginatedItems(stationsResult);
  const station = useMemo(
    () => (ticket ? stations.find((item) => String(item.id) === ticket.stationId) : null),
    [stations, ticket],
  );

  const { data: session } = useTableSession(ticket?.sessionId ? String(ticket.sessionId) : null);
  const { data: tablesResult } = useDiningTables({ page: 1, limit: 200, sortBy: "tableNumber", sortOrder: "asc" });
  const tables = getPaginatedItems(tablesResult);
  const table = useMemo(
    () => (session ? tables.find((item) => String(item.id) === session.tableId) : null),
    [tables, session],
  );
  const { data: zonesResult } = useDiningZones({ page: 1, limit: 200, sortBy: "sortOrder", sortOrder: "asc" });
  const zones = getPaginatedItems(zonesResult);
  const zone = useMemo(
    () => (table ? zones.find((item) => String(item.id) === table.zoneId) : null),
    [zones, table],
  );
  const { data: sectionsResult } = useSections({ page: 1, limit: 200 });
  const sections = getPaginatedItems(sectionsResult);
  const relatedSections = useMemo(
    () =>
      station
        ? sections.filter(
            (section) =>
              section.tenantId === station.tenantId &&
              section.locationId === station.locationId,
          )
        : [],
    [sections, station],
  );

  const { data: allSessionsResult } = useTableSessions({ page: 1, limit: 200, openOnly: true });
  const activeSessionCount = getPaginatedItems(allSessionsResult).filter(
    (row) => row.tenantId === ticket?.tenantId,
  ).length;

  const { data: salesOrder } = useSalesOrder(ticket?.salesOrderId ? String(ticket.salesOrderId) : null);

  const start = useStartKdsTicket();
  const ready = useReadyKdsTicket();
  const recall = useRecallKdsTicket();
  const expedite = useExpediteKdsTicket();
  const readyLine = useReadyKdsTicketLine();

  const [lineId, setLineId] = useState("");

  const overviewRows = useMemo(
    () =>
      ticket
        ? [
            { label: "Ticket ID", value: safeText(ticket.id), mono: true },
            { label: "Ticket #", value: safeText(ticket.ticketNumber) },
            { label: "Status", value: safeText(ticket.status) },
            { label: "Course", value: safeText(ticket.courseType || "—") },
          ]
        : [],
    [ticket],
  );

  const relationRows = useMemo(
    () =>
      ticket
        ? [
            { label: "Station", value: station?.name || safeText(ticket.stationId) },
            { label: "Session", value: session ? safeText(session.id) : safeText(ticket.sessionId || "—"), mono: !session },
            { label: "Sales order", value: salesOrder ? salesOrder.orderNumber : safeText(ticket.salesOrderId || "—") },
            { label: "Dining table", value: table?.tableNumber || "—" },
            { label: "Dining zone", value: zone?.name || "—" },
          ]
        : [],
    [ticket, station, session, salesOrder, table, zone],
  );

  const recordRows = useMemo(
    () =>
      ticket
        ? [
            { label: "Fired at", value: formatDate(ticket.firedAt ?? undefined) },
            { label: "Started at", value: formatDate(ticket.startedAt ?? undefined) },
            { label: "Bumped at", value: formatDate(ticket.bumpedAt ?? undefined) },
            { label: "Created at", value: formatDate(ticket.createdAt ?? undefined) },
            { label: "Updated at", value: formatDate(ticket.updatedAt ?? undefined) },
          ]
        : [],
    [ticket],
  );

  if (isLoading) return <AppLoader fullScreen={false} size="md" message="Loading KDS ticket..." />;
  if (error || !ticket) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">KDS ticket not found or failed to load.</p>
        <Link href="/kds-tickets">
          <Button variant="outline">Back to KDS Tickets</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DetailPageHeader
        backHref="/kds-tickets"
        backLabel="KDS Tickets"
        title={safeText(ticket.ticketNumber)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DetailSection title="Ticket overview" icon={ClipboardList}>
          <DetailRows rows={overviewRows} />
        </DetailSection>
        <DetailSection title="Routing context" icon={Monitor}>
          <DetailRows rows={relationRows} />
        </DetailSection>
        <DetailSection title="Record info" icon={Info} className="lg:col-span-2">
          <DetailRows rows={recordRows} />
        </DetailSection>
      </div>

      <DetailSection title="Kitchen workflow actions" icon={CookingPot}>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            disabled={start.isPending}
            onClick={() =>
              start.mutate(String(ticket.id), {
                onSuccess: () => toast.success("Ticket started."),
                onError: () => toast.error("Failed to start ticket."),
              })
            }
          >
            {start.isPending ? "Starting..." : "Start preparing"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={expedite.isPending}
            onClick={() =>
              expedite.mutate(String(ticket.id), {
                onSuccess: () => toast.success("Ticket expedited."),
                onError: () => toast.error("Failed to expedite ticket."),
              })
            }
          >
            {expedite.isPending ? "Updating..." : "Expedite"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={recall.isPending}
            onClick={() =>
              recall.mutate(String(ticket.id), {
                onSuccess: () => toast.success("Ticket recalled."),
                onError: () => toast.error("Failed to recall ticket."),
              })
            }
          >
            {recall.isPending ? "Recalling..." : "Recall"}
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={ready.isPending}
            onClick={() =>
              ready.mutate(String(ticket.id), {
                onSuccess: () => toast.success("Ticket marked ready."),
                onError: () => toast.error("Failed to mark ticket ready."),
              })
            }
          >
            {ready.isPending ? "Bumping..." : "Bump ticket ready"}
          </Button>
        </div>
      </DetailSection>

      <DetailSection title="Bump a single line" icon={Timer}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="grid gap-2 w-full sm:w-96">
            <Label>Ticket line ID</Label>
            <Input value={lineId} onChange={(e) => setLineId(e.target.value)} placeholder="uuid" />
          </div>
          <Button
            type="button"
            disabled={readyLine.isPending || !lineId.trim()}
            onClick={() =>
              readyLine.mutate(
                { ticketId: String(ticket.id), lineId: lineId.trim() },
                {
                  onSuccess: () => {
                    toast.success("Line marked ready.");
                    setLineId("");
                  },
                  onError: () => toast.error("Failed to mark line ready."),
                },
              )
            }
          >
            {readyLine.isPending ? "Updating..." : "Ready line"}
          </Button>
        </div>
      </DetailSection>

      <DetailSection title="Dining + section linkage" icon={UtensilsCrossed}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-md border border-border p-3">
            <p className="text-xs text-muted">Sections at station location</p>
            <p className="text-lg font-semibold">{relatedSections.length}</p>
            <Link href="/sections" className="text-xs text-mint hover:underline">
              View sections
            </Link>
          </div>
          <div className="rounded-md border border-border p-3">
            <p className="text-xs text-muted">Active table sessions</p>
            <p className="text-lg font-semibold">{activeSessionCount}</p>
            <Link href="/table-sessions" className="text-xs text-mint hover:underline">
              View table sessions
            </Link>
          </div>
          <div className="rounded-md border border-border p-3">
            <p className="text-xs text-muted">Station</p>
            <p className="text-lg font-semibold">{station?.name || "—"}</p>
            <Link href="/kds-stations" className="text-xs text-mint hover:underline">
              View KDS stations
            </Link>
          </div>
        </div>
      </DetailSection>
    </div>
  );
}
