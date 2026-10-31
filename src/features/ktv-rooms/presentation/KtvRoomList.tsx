"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/presentation/components/ui/input";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import type { DataTableAction, DataTableColumn } from "@/presentation/components/data-table";
import { ExcelTransferButtons } from "@/presentation/components/excel/ExcelTransferButtons";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { useToast } from "@/presentation/providers/ToastProvider";
import { usePagination } from "@/presentation/hooks/usePagination";
import { useCurrency } from "@/presentation/providers/CurrencyProvider";
import { useLocations } from "@/presentation/hooks/useLocations";
import { getPaginatedItems } from "@/presentation/hooks/pagination";
import {
  useDeleteKtvRoom,
  useKtvRooms,
  useMarkKtvRoomReady,
} from "@/presentation/hooks/useKtvRooms";
import type { KtvRoom, KtvRoomStatus } from "@/core/domain/entities/KtvRoom";
import { apiErrorMessage } from "@/lib/api-error";
import { CreateKtvRoomForm } from "./CreateKtvRoomForm";

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

const STATUS: Record<KtvRoomStatus, { label: string; className: string }> = {
  AVAILABLE: { label: "Available", className: "bg-emerald-100 text-emerald-800" },
  OCCUPIED: { label: "In use", className: "bg-sky-100 text-sky-800" },
  CLEANING: { label: "Being cleaned", className: "bg-amber-100 text-amber-800" },
  OUT_OF_SERVICE: { label: "Out of service", className: "bg-muted text-muted-foreground" },
};

export function KtvRoomList() {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const { formatPrice } = useCurrency();
  const del = useDeleteKtvRoom();
  const ready = useMarkKtvRoomReady();
  const pagination = usePagination({ pageSize: PAGE_SIZE });
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const { data: locationsData } = useLocations({ page: 1, limit: 200 });
  const locations = getPaginatedItems(locationsData);

  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [searchInput]);

  const { data: result, isLoading, error, refetch } = useKtvRooms({
    page: pagination.page,
    limit: PAGE_SIZE,
    search: search || undefined,
  });
  const rooms = result?.items ?? [];

  const columns = useMemo<DataTableColumn<KtvRoom>[]>(
    () => [
      {
        key: "roomNumber",
        header: "Room",
        render: (r) => (
          <button
            type="button"
            className="text-left font-medium hover:text-mint"
            onClick={() => router.push(`/ktv-rooms/${r.id}/edit`)}
          >
            {r.roomNumber}
            {r.name ? <span className="ml-2 text-sm font-normal text-muted">{r.name}</span> : null}
          </button>
        ),
      },
      {
        key: "locationId",
        header: "Outlet",
        render: (r) => (
          <span className="text-sm text-muted">
            {locations.find((l) => String(l.id) === r.locationId)?.name ?? "—"}
          </span>
        ),
      },
      {
        key: "capacity",
        header: "People",
        render: (r) => <span className="text-sm">{r.capacity}</span>,
      },
      {
        key: "pricePerHour",
        header: "Price per hour",
        render: (r) => <span className="text-sm font-medium">{formatPrice(r.pricePerHour)}</span>,
      },
      {
        key: "status",
        header: "Status",
        render: (r) => (
          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS[r.status]?.className ?? ""}`}>
            {STATUS[r.status]?.label ?? r.status}
          </span>
        ),
      },
    ],
    [formatPrice, locations, router],
  );

  const actions = useMemo<DataTableAction<KtvRoom>[]>(
    () => [
      { label: "Edit", onClick: (r) => router.push(`/ktv-rooms/${r.id}/edit`) },
      {
        label: "Mark cleaned",
        disabled: (r: KtvRoom) => r.status !== "CLEANING",
        onClick: (r) =>
          ready.mutate(r.id, {
            onSuccess: () => toast.success(`Room ${r.roomNumber} is available again.`),
            onError: (err) => toast.error(apiErrorMessage(err, "Couldn't update the room.")),
          }),
      },
      {
        label: "Remove",
        variant: "destructive",
        onClick: async (r) => {
          const ok = await confirm({
            title: "Remove room",
            description: `Remove room ${r.roomNumber}? Past sessions and sales stay in reports.`,
            confirmLabel: "Remove",
            variant: "destructive",
          });
          if (ok) {
            del.mutate(r.id, {
              onSuccess: () => toast.success(`Room ${r.roomNumber} removed.`),
              onError: (err) => toast.error(apiErrorMessage(err, "Couldn't remove the room.")),
            });
          }
        },
      },
    ],
    [router, ready, toast, confirm, del],
  );

  return (
    <EntityListWithCreateModal<KtvRoom>
      data={rooms}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      loadingText="Loading KTV rooms..."
      emptyText={search ? "No rooms match your search." : "No KTV rooms yet. Add your first room."}
      error={
        error
          ? { message: apiErrorMessage(error, "Failed to load KTV rooms."), onRetry: () => refetch() }
          : undefined
      }
      topContent={
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by room number or name..."
          />
        </div>
      }
      toolbarEndContent={<ExcelTransferButtons kind="ktv-rooms" />}
      pageSize={PAGE_SIZE}
      currentPage={pagination.page}
      totalPages={result?.totalPages ?? pagination.getTotalPages(result?.total)}
      totalItems={result?.total ?? 0}
      onPageChange={pagination.setPage}
      addLabel="Add room"
      createTitle="Add a KTV room"
      createSubmitText="Add room"
      createLoadingText="Adding..."
      createFormId="create-ktv-room-form"
      createMaxWidth="2xl"
      renderCreateForm={({ formId, onSuccess, onLoadingChange }) => (
        <CreateKtvRoomForm formId={formId} onSuccess={onSuccess} onLoadingChange={onLoadingChange} />
      )}
    />
  );
}
