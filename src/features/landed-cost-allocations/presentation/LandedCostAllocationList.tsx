"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/presentation/components/ui/input";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { useToast } from "@/presentation/providers/ToastProvider";
import { usePagination } from "@/presentation/hooks/usePagination";
import {
  useLandedCostAllocations,
  useDeleteLandedCostAllocation,
} from "@/presentation/hooks/useLandedCostAllocations";
import type { LandedCostAllocation } from "@/core/domain/entities/LandedCostAllocation";
import { CreateLandedCostAllocationForm } from "./CreateLandedCostAllocationForm";
import { getLandedCostAllocationRowActions } from "./landed-cost-allocation-row-actions";
import { getLandedCostAllocationTableColumns } from "./landed-cost-allocation-table-columns";

const CREATE_FORM_ID = "create-landed-cost-allocation-form";
const SEARCH_DEBOUNCE_MS = 300;
const PAGE_SIZE = 10;

export function LandedCostAllocationList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultSourceInvoiceId = searchParams.get("sourceInvoiceId") ?? undefined;
  const defaultGrnId = searchParams.get("grnId") ?? undefined;
  const toast = useToast();
  const confirm = useConfirm();
  const del = useDeleteLandedCostAllocation();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const pagination = usePagination({ pageSize: PAGE_SIZE });

  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [searchInput]);

  const { data: result, isLoading, error, refetch } = useLandedCostAllocations({
    search: search || undefined,
    page: pagination.page,
    limit: PAGE_SIZE,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const items = result?.items ?? [];

  useEffect(() => {
    pagination.reset(1);
  }, [search, pagination.reset]);

  const actions = useMemo(
    () =>
      getLandedCostAllocationRowActions({
        onView: (row) => router.push(`/landed-cost-allocations/${row.id}`),
        onEdit: (row) => router.push(`/landed-cost-allocations/${row.id}/edit`),
        onDelete: async (row) => {
          const ok = await confirm({
            title: "Delete landed cost allocation",
            description: `Delete allocation ${String(row.id).slice(0, 8)}…? This cannot be undone.`,
            confirmLabel: "Delete",
            variant: "destructive",
          });
          if (ok) {
            del.mutate(String(row.id), {
              onSuccess: () => toast.success("Landed cost allocation deleted."),
              onError: () => toast.error("Failed to delete landed cost allocation."),
            });
          }
        },
      }),
    [router, confirm, del, toast]
  );

  const columns = useMemo(
    () =>
      getLandedCostAllocationTableColumns({
        onView: (row) => router.push(`/landed-cost-allocations/${row.id}`),
      }),
    [router],
  );

  return (
    <EntityListWithCreateModal<LandedCostAllocation>
      data={items}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      loadingText="Loading landed cost allocations..."
      emptyText={
        search
          ? "No landed cost allocations match your search."
          : "No landed cost allocations yet."
      }
      error={
        error
          ? {
              message: "Failed to load landed cost allocations.",
              onRetry: () => refetch(),
            }
          : undefined
      }
      topContent={
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search landed cost allocations..."
          />
        </div>
      }
      pageSize={PAGE_SIZE}
      currentPage={pagination.page}
      totalPages={result?.totalPages ?? pagination.getTotalPages(result?.total)}
      totalItems={result?.total ?? 0}
      onPageChange={pagination.setPage}
      addLabel="New Landed Cost Allocation"
      createTitle="Create Landed Cost Allocation"
      createSubmitText="Create Landed Cost Allocation"
      createLoadingText="Creating..."
      createFormId={CREATE_FORM_ID}
      createMaxWidth="2xl"
      renderCreateForm={({ formId, onSuccess, onLoadingChange }) => (
        <CreateLandedCostAllocationForm
          formId={formId}
          onSuccess={onSuccess}
          onLoadingChange={onLoadingChange}
          defaultSourceInvoiceId={defaultSourceInvoiceId}
          defaultGrnId={defaultGrnId}
        />
      )}
    />
  );
}
