"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { useToast } from "@/presentation/providers/ToastProvider";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import {
  useDepreciationSchedules,
  useDeleteDepreciationSchedule,
} from "@/presentation/hooks/useDepreciationSchedules";
import { useFixedAsset } from "@/presentation/hooks/useFixedAssets";
import { usePagination } from "@/presentation/hooks/usePagination";
import type { DepreciationSchedule } from "@/core/domain/entities/DepreciationSchedule";
import { CreateDepreciationScheduleForm } from "./CreateDepreciationScheduleForm";
import { getDepreciationScheduleRowActions } from "./depreciation-schedule-row-actions";
import { getDepreciationScheduleTableColumns } from "./depreciation-schedule-table-columns";

const CREATE_FORM_ID = "create-depreciation-schedule-form";
const PAGE_SIZE = 10;

export interface DepreciationScheduleListProps {
  fixedAssetId: string;
  routeBasePath?: string;
}

export function DepreciationScheduleList({
  fixedAssetId,
  routeBasePath,
}: DepreciationScheduleListProps) {
  const router = useRouter();
  const pagination = usePagination({ pageSize: PAGE_SIZE });
  useFixedAsset(fixedAssetId);
  const { data: schedulesResult, isLoading, error, refetch } = useDepreciationSchedules(
    fixedAssetId,
    { page: pagination.page, limit: PAGE_SIZE, sortBy: "createdAt", sortOrder: "desc" }
  );
  const schedules = schedulesResult?.items ?? [];
  const del = useDeleteDepreciationSchedule(fixedAssetId);
  const toast = useToast();
  const confirm = useConfirm();

  const basePath = routeBasePath ?? `/depreciation-schedules/${fixedAssetId}`;

  const actions = useMemo(
    () =>
      getDepreciationScheduleRowActions({
        onView: (s) => router.push(`${basePath}/${s.id}`),
        onEdit: (s) => router.push(`${basePath}/${s.id}/edit`),
        onDelete: async (s) => {
          const ok = await confirm({
            title: "Delete depreciation schedule",
            description: "Delete this depreciation schedule? This cannot be undone.",
            confirmLabel: "Delete",
            variant: "destructive",
          });
          if (ok) {
            del.mutate(String(s.id), {
              onSuccess: () => toast.success("Depreciation schedule deleted."),
              onError: () => toast.error("Failed to delete depreciation schedule."),
            });
          }
        },
      }),
    [router, basePath, confirm, del, toast]
  );

  const columns = useMemo(
    () =>
      getDepreciationScheduleTableColumns({
        onView: (s) => router.push(`${basePath}/${s.id}`),
      }),
    [router, basePath]
  );

  return (
    <EntityListWithCreateModal<DepreciationSchedule>
      data={schedules}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      loadingText="Loading depreciation schedules..."
      emptyText="No depreciation schedules yet."
      error={
        error
          ? {
              message: "Failed to load depreciation schedules.",
              onRetry: () => refetch(),
            }
          : undefined
      }
      pageSize={PAGE_SIZE}
      currentPage={pagination.page}
      totalPages={
        schedulesResult?.totalPages ?? pagination.getTotalPages(schedulesResult?.total)
      }
      totalItems={schedulesResult?.total ?? 0}
      onPageChange={pagination.setPage}
      addLabel="New Schedule"
      createTitle="Create Depreciation Schedule"
      createSubmitText="Create Schedule"
      createLoadingText="Creating..."
      createFormId={CREATE_FORM_ID}
      createMaxWidth="2xl"
      renderCreateForm={({ formId, onSuccess, onLoadingChange }) => (
        <CreateDepreciationScheduleForm
          fixedAssetId={fixedAssetId}
          formId={formId}
          onSuccess={onSuccess}
          onLoadingChange={onLoadingChange}
        />
      )}
    />
  );
}
