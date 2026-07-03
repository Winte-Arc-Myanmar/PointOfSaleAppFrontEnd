"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CookingPot, Hourglass, Info, Sofa, Users } from "lucide-react";
import { AppLoader } from "@/presentation/components/loader";
import { Button } from "@/presentation/components/ui/button";
import { Label } from "@/presentation/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import {
  DetailPageHeader,
  DetailRows,
  DetailSection,
  formatDate,
  safeText,
} from "@/presentation/components/detail";
import { useToast } from "@/presentation/providers/ToastProvider";
import { getPaginatedItems } from "@/presentation/hooks/pagination";
import { useDiningZones } from "@/presentation/hooks/useDiningZones";
import { useDiningTables } from "@/presentation/hooks/useDiningTables";
import { useSections } from "@/presentation/hooks/useSections";
import { useUsers } from "@/presentation/hooks/useUsers";
import { usePosRegisters } from "@/presentation/hooks/usePosRegisters";
import { usePosSessions } from "@/presentation/hooks/usePosSessions";
import { useKdsStations } from "@/presentation/hooks/useKdsStations";
import { useKdsTickets } from "@/presentation/hooks/useKdsTickets";
import { useTableSession } from "@/presentation/hooks/useTableSessions";
import { useReservations } from "@/presentation/hooks/useReservations";
import {
  useCancelWaitlistEntry,
  useNoShowWaitlistEntry,
  useNotifyWaitlistEntry,
  useSeatWaitlistEntry,
  useWaitlistEntry,
} from "@/presentation/hooks/useWaitlist";

const seatSchema = z.object({
  tableId: z.string().min(1, "Table is required"),
  waiterId: z.string().min(1, "Waiter is required"),
  guestCount: z.number().int().min(1),
  posRegisterId: z.string().min(1, "POS register is required"),
  openedByPosSessionId: z.string().min(1, "POS session is required"),
});

type SeatFormData = z.infer<typeof seatSchema>;

function getUserLabel(user: any): string {
  return user.fullName || user.username || user.email || String(user.id);
}

export function WaitlistDetail({ waitlistId }: { waitlistId: string }) {
  const toast = useToast();
  const { data: waitlistEntry, isLoading, error } = useWaitlistEntry(waitlistId);
  const notifyWaitlist = useNotifyWaitlistEntry();
  const cancelWaitlist = useCancelWaitlistEntry();
  const noShowWaitlist = useNoShowWaitlistEntry();
  const seatWaitlist = useSeatWaitlistEntry();

  const { data: zonesData } = useDiningZones({ page: 1, limit: 200, sortBy: "sortOrder", sortOrder: "asc" });
  const { data: tablesData } = useDiningTables({ page: 1, limit: 200, sortBy: "tableNumber", sortOrder: "asc" });
  const { data: sectionsData } = useSections({ page: 1, limit: 200 });
  const { data: usersData } = useUsers({ page: 1, limit: 200 });
  const { data: registersData } = usePosRegisters({ page: 1, limit: 200 });
  const { data: posSessionsData } = usePosSessions({ page: 1, limit: 200 });
  const { data: kdsStationsData } = useKdsStations({ page: 1, limit: 200, sortBy: "name", sortOrder: "asc" });
  const { data: kdsTicketsData } = useKdsTickets({
    page: 1,
    limit: 200,
    sessionId: waitlistEntry?.tableSessionId || undefined,
  });
  const { data: reservationsData } = useReservations({
    page: 1,
    limit: 200,
    locationId: waitlistEntry?.locationId || undefined,
    sortBy: "reservedAt",
    sortOrder: "desc",
  });
  const { data: tableSession } = useTableSession(waitlistEntry?.tableSessionId || null);

  const zones = getPaginatedItems(zonesData);
  const tables = getPaginatedItems(tablesData);
  const sections = getPaginatedItems(sectionsData);
  const users = getPaginatedItems(usersData);
  const registers = getPaginatedItems(registersData);
  const posSessions = getPaginatedItems(posSessionsData);
  const kdsStations = getPaginatedItems(kdsStationsData);
  const reservations = reservationsData?.items ?? [];
  const kdsTickets = kdsTicketsData?.items ?? [];

  const seatForm = useForm<SeatFormData>({
    resolver: zodResolver(seatSchema),
    defaultValues: {
      tableId: "",
      waiterId: "",
      guestCount: waitlistEntry?.partySize ?? 2,
      posRegisterId: "",
      openedByPosSessionId: "",
    },
  });

  const relatedTables = useMemo(
    () =>
      waitlistEntry
        ? tables.filter((table) => table.tenantId === waitlistEntry.tenantId)
        : [],
    [waitlistEntry, tables],
  );

  const relatedZones = useMemo(
    () =>
      waitlistEntry
        ? zones.filter((zone) => zone.tenantId === waitlistEntry.tenantId)
        : [],
    [waitlistEntry, zones],
  );

  const relatedSections = useMemo(
    () =>
      waitlistEntry
        ? sections.filter(
            (section) =>
              section.tenantId === waitlistEntry.tenantId &&
              section.locationId === waitlistEntry.locationId,
          )
        : [],
    [waitlistEntry, sections],
  );

  const relatedKdsStations = useMemo(
    () =>
      waitlistEntry
        ? kdsStations.filter(
            (station) =>
              station.tenantId === waitlistEntry.tenantId &&
              station.locationId === waitlistEntry.locationId,
          )
        : [],
    [kdsStations, waitlistEntry],
  );

  const relatedReservations = useMemo(
    () =>
      waitlistEntry
        ? reservations.filter((reservation) => reservation.tenantId === waitlistEntry.tenantId)
        : [],
    [reservations, waitlistEntry],
  );

  const preferredZone = useMemo(
    () =>
      waitlistEntry?.preferredZoneId
        ? zones.find((zone) => String(zone.id) === String(waitlistEntry.preferredZoneId))
        : null,
    [waitlistEntry?.preferredZoneId, zones],
  );

  const assignedTable = useMemo(
    () =>
      waitlistEntry?.assignedTableId
        ? tables.find((table) => String(table.id) === String(waitlistEntry.assignedTableId))
        : null,
    [waitlistEntry?.assignedTableId, tables],
  );

  const seatable = waitlistEntry && ["WAITING", "NOTIFIED"].includes(waitlistEntry.status);
  const notifyable = waitlistEntry && waitlistEntry.status === "WAITING";

  const overviewRows = waitlistEntry
    ? [
        { label: "Waitlist ID", value: safeText(waitlistEntry.id), mono: true },
        { label: "Guest", value: safeText(waitlistEntry.guestName) },
        { label: "Status", value: safeText(waitlistEntry.status) },
        { label: "Party size", value: String(waitlistEntry.partySize) },
        { label: "Joined at", value: formatDate(waitlistEntry.joinedAt ?? undefined) },
      ]
    : [];

  const relationRows = waitlistEntry
    ? [
        { label: "Preferred zone", value: preferredZone?.name || safeText(waitlistEntry.preferredZoneId || "-") },
        { label: "Assigned table", value: assignedTable?.tableNumber || safeText(waitlistEntry.assignedTableId || "-") },
        { label: "Table session ID", value: safeText(waitlistEntry.tableSessionId || "-"), mono: true },
        { label: "Customer ID", value: safeText(waitlistEntry.customerId || "-"), mono: true },
      ]
    : [];

  const recordRows = waitlistEntry
    ? [
        { label: "Tenant ID", value: safeText(waitlistEntry.tenantId), mono: true },
        { label: "Location ID", value: safeText(waitlistEntry.locationId), mono: true },
        { label: "Notified at", value: formatDate(waitlistEntry.notifiedAt ?? undefined) },
        { label: "Seated at", value: formatDate(waitlistEntry.seatedAt ?? undefined) },
        { label: "Canceled at", value: formatDate(waitlistEntry.canceledAt ?? undefined) },
      ]
    : [];

  if (isLoading) return <AppLoader fullScreen={false} size="md" message="Loading waitlist entry..." />;
  if (error || !waitlistEntry) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Waitlist entry not found or failed to load.</p>
        <Link href="/waitlist">
          <Button variant="outline">Back to Waitlist</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DetailPageHeader
        backHref="/waitlist"
        backLabel="Waitlist"
        title={waitlistEntry.guestName}
        editHref={`/waitlist/${waitlistEntry.id}/edit`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DetailSection title="Waitlist overview" icon={Hourglass}>
          <DetailRows rows={overviewRows} />
        </DetailSection>
        <DetailSection title="Dining relation" icon={Sofa}>
          <DetailRows rows={relationRows} />
        </DetailSection>
        <DetailSection title="Record info" icon={Info} className="lg:col-span-2">
          <DetailRows rows={recordRows} />
        </DetailSection>
      </div>

      <DetailSection title="Waitlist actions" icon={Users}>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={!notifyable}
            onClick={() =>
              notifyWaitlist.mutate(String(waitlistEntry.id), {
                onSuccess: () => toast.success("Party notified."),
                onError: () => toast.error("Failed to notify party."),
              })
            }
          >
            Notify
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              cancelWaitlist.mutate(String(waitlistEntry.id), {
                onSuccess: () => toast.success("Waitlist entry canceled."),
                onError: () => toast.error("Failed to cancel waitlist entry."),
              })
            }
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              noShowWaitlist.mutate(String(waitlistEntry.id), {
                onSuccess: () => toast.success("Marked as no-show."),
                onError: () => toast.error("Failed to mark no-show."),
              })
            }
          >
            No-show
          </Button>
        </div>
      </DetailSection>

      <DetailSection title="Seat party (opens table session)" icon={Sofa}>
        {!seatable ? (
          <p className="text-sm text-muted">
            Party can only be seated when status is WAITING or NOTIFIED.
          </p>
        ) : (
          <form
            className="grid grid-cols-1 lg:grid-cols-5 gap-3 items-end"
            onSubmit={seatForm.handleSubmit((data) =>
              seatWaitlist.mutate(
                {
                  id: String(waitlistEntry.id),
                  data,
                },
                {
                  onSuccess: () => toast.success("Party seated and table session opened."),
                  onError: () => toast.error("Failed to seat party."),
                },
              ),
            )}
          >
            <div className="grid gap-2">
              <Label>Table</Label>
              <Controller
                control={seatForm.control}
                name="tableId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select table" />
                    </SelectTrigger>
                    <SelectContent>
                      {relatedTables.map((table) => (
                        <SelectItem key={table.id} value={String(table.id)}>
                          {table.tableNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="grid gap-2">
              <Label>Waiter</Label>
              <Controller
                control={seatForm.control}
                name="waiterId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select waiter" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={String(user.id)}>
                          {getUserLabel(user)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="grid gap-2">
              <Label>Guests</Label>
              <input
                type="number"
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                {...seatForm.register("guestCount", { valueAsNumber: true })}
              />
            </div>
            <div className="grid gap-2">
              <Label>POS register</Label>
              <Controller
                control={seatForm.control}
                name="posRegisterId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select register" />
                    </SelectTrigger>
                    <SelectContent>
                      {registers.map((register) => (
                        <SelectItem key={register.id} value={String(register.id)}>
                          {register.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="grid gap-2">
              <Label>Opened by session</Label>
              <Controller
                control={seatForm.control}
                name="openedByPosSessionId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select POS session" />
                    </SelectTrigger>
                    <SelectContent>
                      {posSessions.map((session) => (
                        <SelectItem key={session.id} value={String(session.id)}>
                          {String(session.id)} ({session.status})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="lg:col-span-5">
              <Button type="submit" disabled={seatWaitlist.isPending}>
                {seatWaitlist.isPending ? "Seating..." : "Seat party"}
              </Button>
            </div>
          </form>
        )}
      </DetailSection>

      <DetailSection title="Connected dining, reservations, and KDS context" icon={CookingPot}>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3 text-sm">
          <div className="rounded-md border border-border p-3">
            <p className="text-xs text-muted">Dining zones (tenant)</p>
            <p className="text-lg font-semibold">{relatedZones.length}</p>
            <Link href="/dining-zones" className="text-xs text-mint hover:underline">
              View dining zones
            </Link>
          </div>
          <div className="rounded-md border border-border p-3">
            <p className="text-xs text-muted">Sections (location)</p>
            <p className="text-lg font-semibold">{relatedSections.length}</p>
            <Link href="/sections" className="text-xs text-mint hover:underline">
              View sections
            </Link>
          </div>
          <div className="rounded-md border border-border p-3">
            <p className="text-xs text-muted">Reservations (location)</p>
            <p className="text-lg font-semibold">{relatedReservations.length}</p>
            <Link href="/reservations" className="text-xs text-mint hover:underline">
              View reservations
            </Link>
          </div>
          <div className="rounded-md border border-border p-3">
            <p className="text-xs text-muted">KDS stations (location)</p>
            <p className="text-lg font-semibold">{relatedKdsStations.length}</p>
            <Link href="/kds-stations" className="text-xs text-mint hover:underline">
              View KDS stations
            </Link>
          </div>
          <div className="rounded-md border border-border p-3">
            <p className="text-xs text-muted">KDS tickets (session)</p>
            <p className="text-lg font-semibold">{kdsTickets.length}</p>
            <Link href="/kds-tickets" className="text-xs text-mint hover:underline">
              View KDS tickets
            </Link>
          </div>
        </div>

        {tableSession ? (
          <div className="mt-4 rounded-md border border-border p-3 text-sm">
            <p className="font-medium">Linked table session</p>
            <p className="text-muted">
              Session {String(tableSession.id)} is currently {tableSession.sessionState}.
            </p>
            <Link href={`/table-sessions/${tableSession.id}`} className="text-xs text-mint hover:underline">
              Open table session
            </Link>
          </div>
        ) : null}
      </DetailSection>
    </div>
  );
}
