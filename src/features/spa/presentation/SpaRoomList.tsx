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
import { useLocations } from "@/presentation/hooks/useLocations";
import { getPaginatedItems } from "@/presentation/hooks/pagination";
import {
  useCreateSpaRoom,
  useDeleteSpaRoom,
  useMarkSpaRoomReady,
  useSpaRooms,
} from "@/presentation/hooks/useSpa";
import type { SpaRoom } from "@/core/domain/entities/Spa";
import { apiErrorMessage } from "@/lib/api-error";
import { SpaRoomForm } from "./SpaRoomForm";
import { ROOM_STATUS } from "./room-status";
import { StatusBadge } from "@/presentation/components/ui/status-badge";

const PAGE_SIZE = 20;

function CreateSpaRoomForm({
  formId,
  onSuccess,
  onLoadingChange,
}: {
  formId: string;
  onSuccess?: () => void;
  onLoadingChange?: (loading: boolean) => void;
}) {
  const create = useCreateSpaRoom();
  const toast = useToast();
  useEffect(() => onLoadingChange?.(create.isPending), [create.isPending, onLoadingChange]);
  return (
    <SpaRoomForm
      formId={formId}
      onSubmit={(data) =>
        create.mutate(data, {
          onSuccess: () => {
            toast.success(`Room ${data.roomNumber} added.`);
            onSuccess?.();
          },
          onError: (error) => toast.error(apiErrorMessage(error, "Couldn't add the room.")),
        })
      }
    />
  );
}

export function SpaRoomList() {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const del = useDeleteSpaRoom();
  const ready = useMarkSpaRoomReady();
  const pagination = usePagination({ pageSize: PAGE_SIZE });
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const { data: locationsData } = useLocations({ page: 1, limit: 200 });
  const locations = getPaginatedItems(locationsData);

  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  const { data: result, isLoading, error, refetch } = useSpaRooms({
    page: pagination.page,
    limit: PAGE_SIZE,
    search: search || undefined,
  });

  const columns = useMemo<DataTableColumn<SpaRoom>[]>(
    () => [
      {
        key: "roomNumber",
        header: "Room",
        render: (r) => (
          <button type="button" className="text-left font-medium hover:text-mint" onClick={() => router.push(`/spa-rooms/${r.id}/edit`)}>
            {r.roomNumber}
            {r.name ? <span className="ml-2 text-sm font-normal text-muted">{r.name}</span> : null}
          </button>
        ),
      },
      {
        key: "locationId",
        header: "Outlet",
        render: (r) => (
          <span className="text-sm text-muted">{locations.find((l) => String(l.id) === r.locationId)?.name ?? "—"}</span>
        ),
      },
      { key: "capacity", header: "Guests", render: (r) => <span className="text-sm">{r.capacity}</span> },
      {
        key: "status",
        header: "Status",
        render: (r) => (
          <StatusBadge status={r.status} label={ROOM_STATUS[r.status]?.label} />
        ),
      },
    ],
    [locations, router],
  );

  const actions = useMemo<DataTableAction<SpaRoom>[]>(
    () => [
      { label: "Edit", onClick: (r) => router.push(`/spa-rooms/${r.id}/edit`) },
      {
        label: "Mark cleaned",
        disabled: (r: SpaRoom) => r.status !== "CLEANING",
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
            description: `Remove room ${r.roomNumber}? Past treatments and sales stay in reports.`,
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
    <EntityListWithCreateModal<SpaRoom>
      data={result?.items ?? []}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      loadingText="Loading SPA rooms..."
      emptyText={search ? "No rooms match your search." : "No SPA rooms yet. Add your first room."}
      error={error ? { message: apiErrorMessage(error, "Failed to load SPA rooms."), onRetry: () => refetch() } : undefined}
      topContent={
        <div className="mb-4">
          <Input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search by room number or name..." />
        </div>
      }
      toolbarEndContent={<ExcelTransferButtons kind="spa-rooms" />}
      pageSize={PAGE_SIZE}
      currentPage={pagination.page}
      totalPages={result?.totalPages ?? pagination.getTotalPages(result?.total)}
      totalItems={result?.total ?? 0}
      onPageChange={pagination.setPage}
      addLabel="Add room"
      createTitle="Add a SPA room"
      createSubmitText="Add room"
      createLoadingText="Adding..."
      createFormId="create-spa-room-form"
      createMaxWidth="2xl"
      renderCreateForm={({ formId, onSuccess, onLoadingChange }) => (
        <CreateSpaRoomForm formId={formId} onSuccess={onSuccess} onLoadingChange={onLoadingChange} />
      )}
    />
  );
}
