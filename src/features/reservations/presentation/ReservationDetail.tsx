"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarClock, CookingPot, Info, Sofa, Users } from "lucide-react";
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
import {
  useCancelReservation,
  useConfirmReservation,
  useNoShowReservation,
  useReservation,
  useSeatReservation,
} from "@/presentation/hooks/useReservations";

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

export function ReservationDetail({ reservationId }: { reservationId: string }) {
  const toast = useToast();
  const { data: reservation, isLoading, error } = useReservation(reservationId);
  const confirmReservation = useConfirmReservation();
  const cancelReservation = useCancelReservation();
  const noShowReservation = useNoShowReservation();
  const seatReservation = useSeatReservation();

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
    sessionId: reservation?.tableSessionId || undefined,
  });
  const { data: tableSession } = useTableSession(reservation?.tableSessionId || null);

  const zones = getPaginatedItems(zonesData);
  const tables = getPaginatedItems(tablesData);
  const sections = getPaginatedItems(sectionsData);
  const users = getPaginatedItems(usersData);
  const registers = getPaginatedItems(registersData);
  const posSessions = getPaginatedItems(posSessionsData);
  const kdsStations = getPaginatedItems(kdsStationsData);
  const kdsTickets = kdsTicketsData?.items ?? [];

  const seatForm = useForm<SeatFormData>({
    resolver: zodResolver(seatSchema),
    defaultValues: {
      tableId: "",
      waiterId: "",
      guestCount: reservation?.partySize ?? 2,
      posRegisterId: "",
      openedByPosSessionId: "",
    },
  });

  const relatedTables = useMemo(
    () =>
      reservation
        ? tables.filter((table) => table.tenantId === reservation.tenantId)
        : [],
    [reservation, tables],
  );

  const relatedZones = useMemo(
    () =>
      reservation
        ? zones.filter((zone) => zone.tenantId === reservation.tenantId)
        : [],
    [reservation, zones],
  );

  const relatedSections = useMemo(
    () =>
      reservation
        ? sections.filter(
            (section) =>
              section.tenantId === reservation.tenantId &&
              section.locationId === reservation.locationId,
          )
        : [],
    [reservation, sections],
  );

  const relatedKdsStations = useMemo(
    () =>
      reservation
        ? kdsStations.filter(
            (station) =>
              station.tenantId === reservation.tenantId &&
              station.locationId === reservation.locationId,
          )
        : [],
    [kdsStations, reservation],
  );

  const preferredZone = useMemo(
    () =>
      reservation?.preferredZoneId
        ? zones.find((zone) => String(zone.id) === String(reservation.preferredZoneId))
        : null,
    [reservation?.preferredZoneId, zones],
  );
  const assignedTable = useMemo(
    () =>
      reservation?.assignedTableId
        ? tables.find((table) => String(table.id) === String(reservation.assignedTableId))
        : null,
    [reservation?.assignedTableId, tables],
  );

  const seatable = reservation && ["PENDING", "CONFIRMED"].includes(reservation.status);

  const overviewRows = reservation
    ? [
        { label: "Reservation ID", value: safeText(reservation.id), mono: true },
        { label: "Guest", value: safeText(reservation.guestName) },
        { label: "Status", value: safeText(reservation.status) },
        { label: "Party size", value: String(reservation.partySize) },
        { label: "Reserved at", value: formatDate(reservation.reservedAt) },
      ]
    : [];

  const relationRows = reservation
    ? [
        { label: "Preferred zone", value: preferredZone?.name || safeText(reservation.preferredZoneId || "-") },
        { label: "Assigned table", value: assignedTable?.tableNumber || safeText(reservation.assignedTableId || "-") },
        { label: "Table session ID", value: safeText(reservation.tableSessionId || "-"), mono: true },
        { label: "Customer ID", value: safeText(reservation.customerId || "-"), mono: true },
      ]
    : [];

  const recordRows = reservation
    ? [
        { label: "Tenant ID", value: safeText(reservation.tenantId), mono: true },
        { label: "Location ID", value: safeText(reservation.locationId), mono: true },
        { label: "Seated at", value: formatDate(reservation.seatedAt ?? undefined) },
        { label: "Canceled at", value: formatDate(reservation.canceledAt ?? undefined) },
        { label: "Created at", value: formatDate(reservation.createdAt ?? undefined) },
      ]
    : [];

  if (isLoading) return <AppLoader fullScreen={false} size="md" message="Loading reservation..." />;
  if (error || !reservation) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Reservation not found or failed to load.</p>
        <Link href="/reservations">
          <Button variant="outline">Back to Reservations</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DetailPageHeader
        backHref="/reservations"
        backLabel="Reservations"
        title={reservation.guestName}
        editHref={`/reservations/${reservation.id}/edit`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DetailSection title="Reservation overview" icon={CalendarClock}>
          <DetailRows rows={overviewRows} />
        </DetailSection>
        <DetailSection title="Dining relation" icon={Sofa}>
          <DetailRows rows={relationRows} />
        </DetailSection>
        <DetailSection title="Record info" icon={Info} className="lg:col-span-2">
          <DetailRows rows={recordRows} />
        </DetailSection>
      </div>

      <DetailSection title="Reservation actions" icon={Users}>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              confirmReservation.mutate(String(reservation.id), {
                onSuccess: () => toast.success("Reservation confirmed."),
                onError: () => toast.error("Failed to confirm reservation."),
              })
            }
          >
            Confirm
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              cancelReservation.mutate(String(reservation.id), {
                onSuccess: () => toast.success("Reservation canceled."),
                onError: () => toast.error("Failed to cancel reservation."),
              })
            }
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              noShowReservation.mutate(String(reservation.id), {
                onSuccess: () => toast.success("Reservation marked no-show."),
                onError: () => toast.error("Failed to mark no-show."),
              })
            }
          >
            No-show
          </Button>
        </div>
      </DetailSection>

      <DetailSection title="Seat reservation (opens table session)" icon={Sofa}>
        {!seatable ? (
          <p className="text-sm text-muted">
            Reservation can only be seated when status is PENDING or CONFIRMED.
          </p>
        ) : (
          <form
            className="grid grid-cols-1 lg:grid-cols-5 gap-3 items-end"
            onSubmit={seatForm.handleSubmit((data) =>
              seatReservation.mutate(
                {
                  id: String(reservation.id),
                  data,
                },
                {
                  onSuccess: () => toast.success("Reservation seated and table session opened."),
                  onError: () => toast.error("Failed to seat reservation."),
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
              <Button type="submit" disabled={seatReservation.isPending}>
                {seatReservation.isPending ? "Seating..." : "Seat reservation"}
              </Button>
            </div>
          </form>
        )}
      </DetailSection>

      <DetailSection title="Connected dining and KDS context" icon={CookingPot}>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 text-sm">
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
