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
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { useToast } from "@/presentation/providers/ToastProvider";
import { usePagination } from "@/presentation/hooks/usePagination";
import {
  useDeletePricingSchedule,
  usePricingSchedules,
} from "@/presentation/hooks/usePricingSchedules";
import type { PricingSchedule } from "@/core/domain/entities/PricingSchedule";
import { CreatePricingScheduleForm } from "./CreatePricingScheduleForm";
import { getPricingScheduleRowActions } from "./pricing-schedule-row-actions";
import { getPricingScheduleTableColumns } from "./pricing-schedule-table-columns";

const CREATE_FORM_ID = "create-pricing-schedule-form";
const SEARCH_DEBOUNCE_MS = 300;
const PAGE_SIZE = 10;
const ALL = "__all__";

export function PricingScheduleList() {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const del = useDeletePricingSchedule();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState(ALL);
  const pagination = usePagination({ pageSize: PAGE_SIZE });

  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [searchInput]);

  useEffect(() => {
    pagination.reset(1);
  }, [search, activeFilter, pagination.reset]);

  const { data: schedulesResult, isLoading, error, refetch } = usePricingSchedules({
    search: search || undefined,
    page: pagination.page,
    limit: PAGE_SIZE,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const schedules = schedulesResult?.items ?? [];
  const filteredSchedules = useMemo(
    () =>
      activeFilter === ALL
        ? schedules
        : schedules.filter((s) => (activeFilter === "ACTIVE" ? s.isActive : !s.isActive)),
    [schedules, activeFilter],
  );

  const actions = useMemo(
    () =>
      getPricingScheduleRowActions({
        onView: (s) => router.push(`/pricing-schedules/${s.id}`),
        onEdit: (s) => router.push(`/pricing-schedules/${s.id}/edit`),
        onDelete: async (s) => {
          const ok = await confirm({
            title: "Delete pricing schedule",
            description: `Delete "${s.name}"? This cannot be undone.`,
            confirmLabel: "Delete",
            variant: "destructive",
          });
          if (ok) {
            del.mutate(String(s.id), {
              onSuccess: () => toast.success("Pricing schedule deleted."),
              onError: () => toast.error("Failed to delete pricing schedule."),
            });
          }
        },
      }),
    [router, confirm, del, toast],
  );

  const columns = useMemo(
    () =>
      getPricingScheduleTableColumns({
        onView: (s) => router.push(`/pricing-schedules/${s.id}`),
      }),
    [router],
  );

  return (
    <EntityListWithCreateModal<PricingSchedule>
      data={filteredSchedules}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      loadingText="Loading pricing schedules..."
      emptyText={search ? "No pricing schedules match your search." : "No pricing schedules yet."}
      error={
        error
          ? {
              message: "Failed to load pricing schedules.",
              onRetry: () => refetch(),
            }
          : undefined
      }
      topContent={
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search pricing schedules..."
          />
          <Select value={activeFilter} onValueChange={setActiveFilter}>
            <SelectTrigger className="sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All statuses</SelectItem>
              <SelectItem value="ACTIVE">Active only</SelectItem>
              <SelectItem value="INACTIVE">Inactive only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      }
      pageSize={PAGE_SIZE}
      currentPage={pagination.page}
      totalPages={schedulesResult?.totalPages ?? pagination.getTotalPages(schedulesResult?.total)}
      totalItems={schedulesResult?.total ?? 0}
      onPageChange={pagination.setPage}
      addLabel="New Pricing Schedule"
      createTitle="Create Pricing Schedule"
      createSubmitText="Create Schedule"
      createLoadingText="Creating..."
      createFormId={CREATE_FORM_ID}
      createMaxWidth="2xl"
      renderCreateForm={({ formId, onSuccess, onLoadingChange }) => (
        <CreatePricingScheduleForm
          formId={formId}
          onSuccess={onSuccess}
          onLoadingChange={onLoadingChange}
        />
      )}
    />
  );
}
