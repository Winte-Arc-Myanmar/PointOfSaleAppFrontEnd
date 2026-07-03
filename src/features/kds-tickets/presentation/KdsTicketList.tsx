"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/presentation/providers/ToastProvider";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import type { KdsTicket, KdsTicketStatus } from "@/core/domain/entities/KdsTicket";
import { useKdsStations } from "@/presentation/hooks/useKdsStations";
import { useTableSessions } from "@/presentation/hooks/useTableSessions";
import {
  useExpediteKdsTicket,
  useKdsTickets,
  useReadyKdsTicket,
  useRecallKdsTicket,
  useStartKdsTicket,
} from "@/presentation/hooks/useKdsTickets";
import { usePagination } from "@/presentation/hooks/usePagination";
import { getPaginatedItems } from "@/presentation/hooks/pagination";
import { FireKdsTicketForm } from "./FireKdsTicketForm";
import { getKdsTicketRowActions } from "./kds-ticket-row-actions";
import { getKdsTicketTableColumns } from "./kds-ticket-table-columns";

const CREATE_FORM_ID = "fire-kds-ticket-form";
const PAGE_SIZE = 20;
const ALL = "ALL";
const STATUS_OPTIONS: Array<{ label: string; value: string }> = [
  { label: "All statuses", value: ALL },
  { label: "PENDING", value: "PENDING" },
  { label: "PREPARING", value: "PREPARING" },
  { label: "READY", value: "READY" },
  { label: "EXPEDITED", value: "EXPEDITED" },
];

export function KdsTicketList() {
  const router = useRouter();
  const toast = useToast();
  const pagination = usePagination({ pageSize: PAGE_SIZE });

  const [stationFilter, setStationFilter] = useState(ALL);
  const [sessionFilter, setSessionFilter] = useState(ALL);
  const [statusFilter, setStatusFilter] = useState(ALL);
  const [activeOnlyFilter, setActiveOnlyFilter] = useState("ACTIVE_ONLY");

  const { data: stationsResult } = useKdsStations({ page: 1, limit: 200, sortBy: "name", sortOrder: "asc" });
  const stations = getPaginatedItems(stationsResult);
  const { data: sessionsResult } = useTableSessions({ page: 1, limit: 200, sortBy: "openedAt", sortOrder: "desc" });
  const sessions = getPaginatedItems(sessionsResult);

  const { data: ticketsResult, isLoading, error, refetch } = useKdsTickets({
    page: pagination.page,
    limit: PAGE_SIZE,
    stationId: stationFilter !== ALL ? stationFilter : undefined,
    sessionId: sessionFilter !== ALL ? sessionFilter : undefined,
    status: statusFilter !== ALL ? (statusFilter as KdsTicketStatus) : undefined,
    activeOnly: activeOnlyFilter === "ACTIVE_ONLY" ? true : undefined,
  });
  const tickets = ticketsResult?.items ?? [];

  const start = useStartKdsTicket();
  const ready = useReadyKdsTicket();
  const recall = useRecallKdsTicket();
  const expedite = useExpediteKdsTicket();

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

  const sessionLabelById = useMemo(
    () =>
      sessions.reduce(
        (acc, session) => {
          acc[String(session.id)] = `${session.id} (${session.sessionState})`;
          return acc;
        },
        {} as Record<string, string>,
      ),
    [sessions],
  );

  const actions = useMemo(
    () =>
      getKdsTicketRowActions({
        onView: (ticket) => router.push(`/kds-tickets/${ticket.id}`),
        onStart: (ticket) =>
          start.mutate(String(ticket.id), {
            onSuccess: () => toast.success("Ticket started."),
            onError: () => toast.error("Failed to start ticket."),
          }),
        onReady: (ticket) =>
          ready.mutate(String(ticket.id), {
            onSuccess: () => toast.success("Ticket marked ready."),
            onError: () => toast.error("Failed to mark ticket ready."),
          }),
        onRecall: (ticket) =>
          recall.mutate(String(ticket.id), {
            onSuccess: () => toast.success("Ticket recalled."),
            onError: () => toast.error("Failed to recall ticket."),
          }),
        onExpedite: (ticket) =>
          expedite.mutate(String(ticket.id), {
            onSuccess: () => toast.success("Ticket expedited."),
            onError: () => toast.error("Failed to expedite ticket."),
          }),
      }),
    [router, start, ready, recall, expedite, toast],
  );

  const columns = useMemo(
    () =>
      getKdsTicketTableColumns({
        onView: (ticket) => router.push(`/kds-tickets/${ticket.id}`),
        stationLabelById,
        sessionLabelById,
      }),
    [router, stationLabelById, sessionLabelById],
  );

  return (
    <EntityListWithCreateModal<KdsTicket>
      data={tickets}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      loadingText="Loading KDS tickets..."
      emptyText="No KDS tickets found."
      topContent={
        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          <div className="grid gap-2">
            <label className="text-xs text-muted">Station</label>
            <Select
              value={stationFilter}
              onValueChange={(value) => {
                setStationFilter(value);
                pagination.reset(1);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All stations</SelectItem>
                {stations.map((station) => (
                  <SelectItem key={station.id} value={String(station.id)}>
                    {station.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <label className="text-xs text-muted">Session</label>
            <Select
              value={sessionFilter}
              onValueChange={(value) => {
                setSessionFilter(value);
                pagination.reset(1);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All sessions</SelectItem>
                {sessions.map((session) => (
                  <SelectItem key={session.id} value={String(session.id)}>
                    {String(session.id)} ({session.sessionState})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <label className="text-xs text-muted">Visibility</label>
            <Select
              value={activeOnlyFilter}
              onValueChange={(value) => {
                setActiveOnlyFilter(value);
                pagination.reset(1);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE_ONLY">Active only</SelectItem>
                <SelectItem value="ALL">All tickets</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      }
      error={
        error
          ? {
              message: "Failed to load KDS tickets.",
              onRetry: () => refetch(),
            }
          : undefined
      }
      pageSize={PAGE_SIZE}
      currentPage={pagination.page}
      totalPages={ticketsResult?.totalPages ?? pagination.getTotalPages(ticketsResult?.total)}
      totalItems={ticketsResult?.total ?? 0}
      onPageChange={pagination.setPage}
      addLabel="Fire to KDS"
      createTitle="Fire pending lines to KDS"
      createSubmitText="Fire now"
      createLoadingText="Firing..."
      createFormId={CREATE_FORM_ID}
      createMaxWidth="2xl"
      renderCreateForm={({ formId, onSuccess, onLoadingChange }) => (
        <FireKdsTicketForm formId={formId} onSuccess={onSuccess} onLoadingChange={onLoadingChange} />
      )}
    />
  );
}
