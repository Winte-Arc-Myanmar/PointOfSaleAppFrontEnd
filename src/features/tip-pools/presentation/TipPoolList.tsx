"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
import type { TipPool, TipPoolStatus } from "@/core/domain/entities/TipPool";
import { useLocations } from "@/presentation/hooks/useLocations";
import {
  useDeleteTipPool,
  useDistributeTipPool,
  useSettleTipPool,
  useTipPools,
} from "@/presentation/hooks/useTipPools";
import { CreateTipPoolForm } from "./CreateTipPoolForm";
import { getTipPoolRowActions } from "./tip-pool-row-actions";
import { getTipPoolTableColumns } from "./tip-pool-table-columns";

const CREATE_FORM_ID = "create-tip-pool-form";
const PAGE_SIZE = 20;
const ALL = "__all__";

const STATUS_OPTIONS: Array<{ label: string; value: string }> = [
  { label: "All statuses", value: ALL },
  { label: "OPEN", value: "OPEN" },
  { label: "SETTLED", value: "SETTLED" },
];

export function TipPoolList() {
  const router = useRouter();
  const toast = useToast();
  const confirmDialog = useConfirm();
  const pagination = usePagination({ pageSize: PAGE_SIZE });

  const [status, setStatus] = useState(ALL);
  const [locationId, setLocationId] = useState(ALL);

  const { data: locationsData } = useLocations({ page: 1, limit: 200 });
  const locations = getPaginatedItems(locationsData);

  const { data: poolsResult, isLoading, error, refetch } = useTipPools({
    page: pagination.page,
    limit: PAGE_SIZE,
    status: status !== ALL ? (status as TipPoolStatus) : undefined,
    locationId: locationId !== ALL ? locationId : undefined,
  });

  const pools = poolsResult?.items ?? [];
  const remove = useDeleteTipPool();
  const distribute = useDistributeTipPool();
  const settle = useSettleTipPool();

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

  const actions = useMemo(
    () =>
      getTipPoolRowActions({
        onView: (x) => router.push(`/tip-pools/${x.id}`),
        onEdit: (x) => router.push(`/tip-pools/${x.id}/edit`),
        onDistribute: (x) =>
          distribute.mutate(String(x.id), {
            onSuccess: () => toast.success("Pool distributed."),
            onError: () => toast.error("Failed to distribute pool."),
          }),
        onSettle: (x) =>
          settle.mutate(String(x.id), {
            onSuccess: () => toast.success("Pool settled."),
            onError: () => toast.error("Failed to settle pool."),
          }),
        onDelete: async (x) => {
          const ok = await confirmDialog({
            title: "Delete tip pool",
            description: `Delete "${x.name}"?`,
            confirmLabel: "Delete",
            variant: "destructive",
          });
          if (!ok) return;
          remove.mutate(String(x.id), {
            onSuccess: () => toast.success("Tip pool deleted."),
            onError: () => toast.error("Failed to delete tip pool."),
          });
        },
      }),
    [confirmDialog, distribute, remove, router, settle, toast],
  );

  const columns = useMemo(
    () =>
      getTipPoolTableColumns({
        onView: (x) => router.push(`/tip-pools/${x.id}`),
        locationLabelById,
      }),
    [locationLabelById, router],
  );

  return (
    <EntityListWithCreateModal<TipPool>
      data={pools}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      loadingText="Loading tip pools..."
      emptyText="No tip pools found."
      topContent={
        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
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
              message: "Failed to load tip pools.",
              onRetry: () => refetch(),
            }
          : undefined
      }
      pageSize={PAGE_SIZE}
      currentPage={pagination.page}
      totalPages={poolsResult?.totalPages ?? pagination.getTotalPages(poolsResult?.total)}
      totalItems={poolsResult?.total ?? 0}
      onPageChange={pagination.setPage}
      addLabel="Add Tip Pool"
      createTitle="Create Tip Pool"
      createSubmitText="Create Tip Pool"
      createLoadingText="Creating..."
      createFormId={CREATE_FORM_ID}
      createMaxWidth="2xl"
      renderCreateForm={({ formId, onSuccess, onLoadingChange }) => (
        <CreateTipPoolForm formId={formId} onSuccess={onSuccess} onLoadingChange={onLoadingChange} />
      )}
    />
  );
}
