"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/presentation/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { usePagination } from "@/presentation/hooks/usePagination";
import { getPaginatedItems } from "@/presentation/hooks/pagination";
import { useToast } from "@/presentation/providers/ToastProvider";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import type { Reservation, ReservationStatus } from "@/core/domain/entities/Reservation";
import { useLocations } from "@/presentation/hooks/useLocations";
import { useDiningTables } from "@/presentation/hooks/useDiningTables";
import {
  useCancelReservation,
  useConfirmReservation,
  useDeleteReservation,
  useNoShowReservation,
  useReservations,
} from "@/presentation/hooks/useReservations";
import { CreateReservationForm } from "./CreateReservationForm";
import { getReservationRowActions } from "./reservation-row-actions";
import { getReservationTableColumns } from "./reservation-table-columns";

const CREATE_FORM_ID = "create-reservation-form";
const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;
const ALL = "__all__";

const STATUS_OPTIONS: Array<{ label: string; value: string }> = [
  { label: "All statuses", value: ALL },
  { label: "PENDING", value: "PENDING" },
  { label: "CONFIRMED", value: "CONFIRMED" },
  { label: "SEATED", value: "SEATED" },
  { label: "NO_SHOW", value: "NO_SHOW" },
  { label: "CANCELED", value: "CANCELED" },
  { label: "COMPLETED", value: "COMPLETED" },
];

export function ReservationList() {
  const router = useRouter();
  const toast = useToast();
  const confirmDialog = useConfirm();
  const pagination = usePagination({ pageSize: PAGE_SIZE });

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(ALL);
  const [locationId, setLocationId] = useState(ALL);

  const { data: locationsData } = useLocations({ page: 1, limit: 200 });
  const { data: tablesData } = useDiningTables({ page: 1, limit: 200 });
  const locations = getPaginatedItems(locationsData);
  const tables = getPaginatedItems(tablesData);

  const { data: reservationsResult, isLoading, error, refetch } = useReservations({
    page: pagination.page,
    limit: PAGE_SIZE,
    search: search || undefined,
    status: status !== ALL ? (status as ReservationStatus) : undefined,
    locationId: locationId !== ALL ? locationId : undefined,
    sortBy: "reservedAt",
    sortOrder: "asc",
  });

  const reservations = reservationsResult?.items ?? [];
  const remove = useDeleteReservation();
  const confirmReservation = useConfirmReservation();
  const cancelReservation = useCancelReservation();
  const noShowReservation = useNoShowReservation();

  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [searchInput]);

  useEffect(() => {
    pagination.reset(1);
  }, [search, status, locationId, pagination.reset]);

  const locationLabelById = useMemo(
    () =>
      locations.reduce(
        (acc, item) => {
          acc[String(item.id)] = item.name;
          return acc;
        },
        {} as Record<string, string>,
      ),
    [locations],
  );

  const tableLabelById = useMemo(
    () =>
      tables.reduce(
        (acc, item) => {
          acc[String(item.id)] = item.tableNumber;
          return acc;
        },
        {} as Record<string, string>,
      ),
    [tables],
  );

  const actions = useMemo(
    () =>
      getReservationRowActions({
        onView: (x) => router.push(`/reservations/${x.id}`),
        onEdit: (x) => router.push(`/reservations/${x.id}/edit`),
        onSeat: (x) => router.push(`/reservations/${x.id}`),
        onConfirm: (x) =>
          confirmReservation.mutate(String(x.id), {
            onSuccess: () => toast.success("Reservation confirmed."),
            onError: () => toast.error("Failed to confirm reservation."),
          }),
        onCancel: (x) =>
          cancelReservation.mutate(String(x.id), {
            onSuccess: () => toast.success("Reservation canceled."),
            onError: () => toast.error("Failed to cancel reservation."),
          }),
        onNoShow: (x) =>
          noShowReservation.mutate(String(x.id), {
            onSuccess: () => toast.success("Reservation marked no-show."),
            onError: () => toast.error("Failed to mark no-show."),
          }),
        onDelete: async (x) => {
          const ok = await confirmDialog({
            title: "Delete reservation",
            description: `Delete reservation for "${x.guestName}"?`,
            confirmLabel: "Delete",
            variant: "destructive",
          });
          if (!ok) return;
          remove.mutate(String(x.id), {
            onSuccess: () => toast.success("Reservation deleted."),
            onError: () => toast.error("Failed to delete reservation."),
          });
        },
      }),
    [
      cancelReservation,
      confirmDialog,
      confirmReservation,
      noShowReservation,
      remove,
      router,
      toast,
    ],
  );

  const columns = useMemo(
    () =>
      getReservationTableColumns({
        onView: (x) => router.push(`/reservations/${x.id}`),
        locationLabelById,
        tableLabelById,
      }),
    [locationLabelById, router, tableLabelById],
  );

  return (
    <EntityListWithCreateModal<Reservation>
      data={reservations}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      loadingText="Loading reservations..."
      emptyText="No reservations found."
      topContent={
        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by guest name..."
          />
          <Select value={status} onValueChange={setStatus}>
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
          <Select value={locationId} onValueChange={setLocationId}>
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
      }
      error={
        error
          ? {
              message: "Failed to load reservations.",
              onRetry: () => refetch(),
            }
          : undefined
      }
      pageSize={PAGE_SIZE}
      currentPage={pagination.page}
      totalPages={reservationsResult?.totalPages ?? pagination.getTotalPages(reservationsResult?.total)}
      totalItems={reservationsResult?.total ?? 0}
      onPageChange={pagination.setPage}
      addLabel="Add Reservation"
      createTitle="Create Reservation"
      createSubmitText="Create Reservation"
      createLoadingText="Creating..."
      createFormId={CREATE_FORM_ID}
      createMaxWidth="2xl"
      renderCreateForm={({ formId, onSuccess, onLoadingChange }) => (
        <CreateReservationForm formId={formId} onSuccess={onSuccess} onLoadingChange={onLoadingChange} />
      )}
    />
  );
}
