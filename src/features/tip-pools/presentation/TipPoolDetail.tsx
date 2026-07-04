"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { HandCoins, Info, Landmark, Users, UtensilsCrossed } from "lucide-react";
import { AppLoader } from "@/presentation/components/loader";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
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
import { useTableSessions } from "@/presentation/hooks/useTableSessions";
import { useKdsStations } from "@/presentation/hooks/useKdsStations";
import { useKdsTickets } from "@/presentation/hooks/useKdsTickets";
import { useReservations } from "@/presentation/hooks/useReservations";
import { useWaitlist } from "@/presentation/hooks/useWaitlist";
import {
  useAddTipPoolAllocation,
  useDistributeTipPool,
  useRemoveTipPoolAllocation,
  useSettleTipPool,
  useTipPool,
  useTipPoolAllocations,
  useUpdateTipPoolAllocation,
} from "@/presentation/hooks/useTipPools";

function toNumber(value: string, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function TipPoolDetail({ poolId }: { poolId: string }) {
  const toast = useToast();
  const { data: pool, isLoading, error } = useTipPool(poolId);
  const { data: allocationsResult } = useTipPoolAllocations(poolId, {
    page: 1,
    limit: 200,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const addAllocation = useAddTipPoolAllocation();
  const updateAllocation = useUpdateTipPoolAllocation();
  const removeAllocation = useRemoveTipPoolAllocation();
  const distribute = useDistributeTipPool();
  const settle = useSettleTipPool();

  const [newUserId, setNewUserId] = useState("");
  const [newRole, setNewRole] = useState("SERVER");
  const [newHours, setNewHours] = useState("0");
  const [newWeight, setNewWeight] = useState("1");
  const [newAmount, setNewAmount] = useState("0");
  const [newNotes, setNewNotes] = useState("");

  const { data: zonesData } = useDiningZones({ page: 1, limit: 200 });
  const { data: tablesData } = useDiningTables({ page: 1, limit: 200 });
  const { data: sectionsData } = useSections({ page: 1, limit: 200 });
  const { data: sessionsData } = useTableSessions({ page: 1, limit: 200 });
  const { data: stationsData } = useKdsStations({ page: 1, limit: 200 });
  const { data: ticketsData } = useKdsTickets({ page: 1, limit: 200 });
  const { data: reservationsData } = useReservations({ page: 1, limit: 200 });
  const { data: waitlistData } = useWaitlist({ page: 1, limit: 200 });

  const zones = getPaginatedItems(zonesData);
  const tables = getPaginatedItems(tablesData);
  const sections = getPaginatedItems(sectionsData);
  const sessions = getPaginatedItems(sessionsData);
  const stations = getPaginatedItems(stationsData);
  const tickets = ticketsData?.items ?? [];
  const reservations = reservationsData?.items ?? [];
  const waitlistEntries = waitlistData?.items ?? [];
  const allocations = allocationsResult?.items ?? [];

  const relatedZones = useMemo(
    () => (pool ? zones.filter((zone) => zone.tenantId === pool.tenantId) : []),
    [pool, zones],
  );
  const relatedTables = useMemo(
    () => (pool ? tables.filter((table) => table.tenantId === pool.tenantId) : []),
    [pool, tables],
  );
  const relatedSections = useMemo(
    () =>
      pool
        ? sections.filter(
            (section) =>
              section.tenantId === pool.tenantId &&
              section.locationId === pool.locationId,
          )
        : [],
    [pool, sections],
  );
  const relatedSessions = useMemo(
    () => (pool ? sessions.filter((session) => session.tenantId === pool.tenantId) : []),
    [pool, sessions],
  );
  const relatedStations = useMemo(
    () =>
      pool
        ? stations.filter(
            (station) =>
              station.tenantId === pool.tenantId &&
              station.locationId === pool.locationId,
          )
        : [],
    [pool, stations],
  );
  const relatedTickets = useMemo(
    () => (pool ? tickets.filter((ticket) => ticket.tenantId === pool.tenantId) : []),
    [pool, tickets],
  );
  const relatedReservations = useMemo(
    () =>
      pool
        ? reservations.filter(
            (reservation) =>
              reservation.tenantId === pool.tenantId &&
              reservation.locationId === pool.locationId,
          )
        : [],
    [pool, reservations],
  );
  const relatedWaitlist = useMemo(
    () =>
      pool
        ? waitlistEntries.filter(
            (entry) =>
              entry.tenantId === pool.tenantId &&
              entry.locationId === pool.locationId,
          )
        : [],
    [pool, waitlistEntries],
  );

  const overviewRows = pool
    ? [
        { label: "Tip pool ID", value: safeText(pool.id), mono: true },
        { label: "Name", value: safeText(pool.name) },
        { label: "Status", value: safeText(pool.status) },
        { label: "Distribution", value: safeText(pool.distributionMethod) },
        { label: "Total distributable", value: safeText(pool.totalDistributable) },
      ]
    : [];

  const totalsRows = pool
    ? [
        { label: "Total tips", value: safeText(pool.totalTips) },
        { label: "Total service charge", value: safeText(pool.totalServiceCharge) },
        { label: "Include service charge", value: pool.includeServiceCharge ? "Yes" : "No" },
        { label: "Service charge share (bps)", value: String(pool.serviceChargeShareBps) },
        { label: "Period start", value: formatDate(pool.periodStart) },
        { label: "Period end", value: formatDate(pool.periodEnd) },
      ]
    : [];

  const recordRows = pool
    ? [
        { label: "Tenant ID", value: safeText(pool.tenantId), mono: true },
        { label: "Location ID", value: safeText(pool.locationId), mono: true },
        { label: "Settled at", value: formatDate(pool.settledAt ?? undefined) },
        { label: "Settled by", value: safeText(pool.settledBy || "-"), mono: true },
        { label: "Created at", value: formatDate(pool.createdAt ?? undefined) },
      ]
    : [];

  if (isLoading) return <AppLoader fullScreen={false} size="md" message="Loading tip pool..." />;
  if (error || !pool) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Tip pool not found or failed to load.</p>
        <Link href="/tip-pools">
          <Button variant="outline">Back to Tip Pools</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DetailPageHeader
        backHref="/tip-pools"
        backLabel="Tip Pools"
        title={pool.name}
        editHref={`/tip-pools/${pool.id}/edit`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DetailSection title="Pool overview" icon={HandCoins}>
          <DetailRows rows={overviewRows} />
        </DetailSection>
        <DetailSection title="Pool totals" icon={Landmark}>
          <DetailRows rows={totalsRows} />
        </DetailSection>
        <DetailSection title="Record info" icon={Info} className="lg:col-span-2">
          <DetailRows rows={recordRows} />
        </DetailSection>
      </div>

      <DetailSection title="Pool actions" icon={HandCoins}>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              distribute.mutate(String(pool.id), {
                onSuccess: () => toast.success("Pool distributed."),
                onError: () => toast.error("Failed to distribute pool."),
              })
            }
          >
            Distribute
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              settle.mutate(String(pool.id), {
                onSuccess: () => toast.success("Pool settled."),
                onError: () => toast.error("Failed to settle pool."),
              })
            }
          >
            Settle
          </Button>
        </div>
      </DetailSection>

      <DetailSection title="Allocations" icon={Users}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="grid gap-2">
              <Label>User ID</Label>
              <Input value={newUserId} onChange={(e) => setNewUserId(e.target.value)} placeholder="uuid" />
            </div>
            <div className="grid gap-2">
              <Label>Role</Label>
              <Input value={newRole} onChange={(e) => setNewRole(e.target.value)} placeholder="SERVER" />
            </div>
            <div className="grid gap-2">
              <Label>Hours</Label>
              <Input value={newHours} onChange={(e) => setNewHours(e.target.value)} type="number" />
            </div>
            <div className="grid gap-2">
              <Label>Weight</Label>
              <Input value={newWeight} onChange={(e) => setNewWeight(e.target.value)} type="number" />
            </div>
            <div className="grid gap-2">
              <Label>Amount</Label>
              <Input value={newAmount} onChange={(e) => setNewAmount(e.target.value)} type="number" />
            </div>
            <div className="grid gap-2">
              <Label>Notes</Label>
              <Input value={newNotes} onChange={(e) => setNewNotes(e.target.value)} placeholder="optional" />
            </div>
          </div>
          <Button
            type="button"
            onClick={() =>
              addAllocation.mutate(
                {
                  id: String(pool.id),
                  data: {
                    userId: newUserId.trim(),
                    role: newRole.trim() || "SERVER",
                    hoursWorked: toNumber(newHours, 0),
                    weight: toNumber(newWeight, 1),
                    amount: toNumber(newAmount, 0),
                    notes: newNotes.trim() || null,
                  },
                },
                {
                  onSuccess: () => {
                    toast.success("Allocation added.");
                    setNewUserId("");
                    setNewRole("SERVER");
                    setNewHours("0");
                    setNewWeight("1");
                    setNewAmount("0");
                    setNewNotes("");
                  },
                  onError: () => toast.error("Failed to add allocation."),
                },
              )
            }
          >
            Add allocation
          </Button>

          {allocations.length === 0 ? (
            <p className="text-sm text-muted">No allocations yet.</p>
          ) : (
            <div className="space-y-2">
              {allocations.map((allocation) => (
                <div
                  key={allocation.id}
                  className="flex flex-col lg:flex-row lg:items-center lg:justify-between rounded-md border border-border p-3 gap-3"
                >
                  <div className="text-sm">
                    <p className="font-medium">
                      {allocation.role} - {allocation.amount}
                    </p>
                    <p className="text-muted">
                      User: {allocation.userId} | Hours: {allocation.hoursWorked} | Weight: {allocation.weight}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        updateAllocation.mutate(
                          {
                            id: String(pool.id),
                            allocationId: String(allocation.id),
                            data: {
                              role: allocation.role,
                              hoursWorked: Number(allocation.hoursWorked),
                              weight: Number(allocation.weight),
                              amount: Number(allocation.amount),
                              notes: allocation.notes ?? null,
                            },
                          },
                          {
                            onSuccess: () => toast.success("Allocation refreshed."),
                            onError: () => toast.error("Failed to update allocation."),
                          },
                        )
                      }
                    >
                      Update
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        removeAllocation.mutate(
                          { id: String(pool.id), allocationId: String(allocation.id) },
                          {
                            onSuccess: () => toast.success("Allocation removed."),
                            onError: () => toast.error("Failed to remove allocation."),
                          },
                        )
                      }
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DetailSection>

      <DetailSection title="Connected operations context" icon={UtensilsCrossed}>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-8 gap-3 text-sm">
          <div className="rounded-md border border-border p-3">
            <p className="text-xs text-muted">Dining zones</p>
            <p className="text-lg font-semibold">{relatedZones.length}</p>
          </div>
          <div className="rounded-md border border-border p-3">
            <p className="text-xs text-muted">Dining tables</p>
            <p className="text-lg font-semibold">{relatedTables.length}</p>
          </div>
          <div className="rounded-md border border-border p-3">
            <p className="text-xs text-muted">Table sessions</p>
            <p className="text-lg font-semibold">{relatedSessions.length}</p>
          </div>
          <div className="rounded-md border border-border p-3">
            <p className="text-xs text-muted">KDS stations</p>
            <p className="text-lg font-semibold">{relatedStations.length}</p>
          </div>
          <div className="rounded-md border border-border p-3">
            <p className="text-xs text-muted">KDS tickets</p>
            <p className="text-lg font-semibold">{relatedTickets.length}</p>
          </div>
          <div className="rounded-md border border-border p-3">
            <p className="text-xs text-muted">Reservations</p>
            <p className="text-lg font-semibold">{relatedReservations.length}</p>
          </div>
          <div className="rounded-md border border-border p-3">
            <p className="text-xs text-muted">Waitlist</p>
            <p className="text-lg font-semibold">{relatedWaitlist.length}</p>
          </div>
          <div className="rounded-md border border-border p-3">
            <p className="text-xs text-muted">Sections</p>
            <p className="text-lg font-semibold">{relatedSections.length}</p>
          </div>
        </div>
      </DetailSection>
    </div>
  );
}
