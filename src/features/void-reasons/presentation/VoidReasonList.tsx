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
import { useDeleteVoidReason, useVoidReasons } from "@/presentation/hooks/useVoidReasons";
import type { VoidReason } from "@/core/domain/entities/VoidReason";
import { CreateVoidReasonForm } from "./CreateVoidReasonForm";
import { getVoidReasonRowActions } from "./void-reason-row-actions";
import { getVoidReasonTableColumns } from "./void-reason-table-columns";

const CREATE_FORM_ID = "create-void-reason-form";
const SEARCH_DEBOUNCE_MS = 300;
const PAGE_SIZE = 10;
const ALL = "__all__";

export function VoidReasonList() {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const del = useDeleteVoidReason();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [activeOnly, setActiveOnly] = useState(ALL);
  const pagination = usePagination({ pageSize: PAGE_SIZE });

  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [searchInput]);

  useEffect(() => {
    pagination.reset(1);
  }, [search, activeOnly, pagination.reset]);

  const { data: reasonsResult, isLoading, error, refetch } = useVoidReasons({
    search: search || undefined,
    page: pagination.page,
    limit: PAGE_SIZE,
    sortBy: "createdAt",
    sortOrder: "desc",
    activeOnly: activeOnly === "ACTIVE" ? true : activeOnly === "INACTIVE" ? false : undefined,
  });
  const reasons = reasonsResult?.items ?? [];

  const actions = useMemo(
    () =>
      getVoidReasonRowActions({
        onView: (r) => router.push(`/void-reasons/${r.id}`),
        onEdit: (r) => router.push(`/void-reasons/${r.id}/edit`),
        onDelete: async (r) => {
          const ok = await confirm({
            title: "Delete void reason",
            description: `Delete "${r.name}"? This cannot be undone.`,
            confirmLabel: "Delete",
            variant: "destructive",
          });
          if (ok) {
            del.mutate(String(r.id), {
              onSuccess: () => toast.success("Void reason deleted."),
              onError: () => toast.error("Failed to delete void reason."),
            });
          }
        },
      }),
    [router, confirm, del, toast],
  );

  const columns = useMemo(
    () =>
      getVoidReasonTableColumns({
        onView: (r) => router.push(`/void-reasons/${r.id}`),
      }),
    [router],
  );

  return (
    <EntityListWithCreateModal<VoidReason>
      data={reasons}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      loadingText="Loading void reasons..."
      emptyText={search ? "No void reasons match your search." : "No void reasons yet."}
      error={
        error
          ? {
              message: "Failed to load void reasons.",
              onRetry: () => refetch(),
            }
          : undefined
      }
      topContent={
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search void reasons..."
          />
          <Select value={activeOnly} onValueChange={setActiveOnly}>
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
      totalPages={reasonsResult?.totalPages ?? pagination.getTotalPages(reasonsResult?.total)}
      totalItems={reasonsResult?.total ?? 0}
      onPageChange={pagination.setPage}
      addLabel="New Void Reason"
      createTitle="Create Void Reason"
      createSubmitText="Create Reason"
      createLoadingText="Creating..."
      createFormId={CREATE_FORM_ID}
      createMaxWidth="2xl"
      renderCreateForm={({ formId, onSuccess, onLoadingChange }) => (
        <CreateVoidReasonForm
          formId={formId}
          onSuccess={onSuccess}
          onLoadingChange={onLoadingChange}
        />
      )}
    />
  );
}
