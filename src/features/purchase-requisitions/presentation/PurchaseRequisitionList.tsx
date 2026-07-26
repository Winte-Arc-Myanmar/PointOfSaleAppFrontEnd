"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/presentation/components/ui/input";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { useToast } from "@/presentation/providers/ToastProvider";
import { usePagination } from "@/presentation/hooks/usePagination";
import {
  usePurchaseRequisitions,
  useDeletePurchaseRequisition,
} from "@/presentation/hooks/usePurchaseRequisitions";
import type { PurchaseRequisition } from "@/core/domain/entities/PurchaseRequisition";
import { CreatePurchaseRequisitionForm } from "./CreatePurchaseRequisitionForm";
import { getPurchaseRequisitionRowActions } from "./purchase-requisition-row-actions";
import { getPurchaseRequisitionTableColumns } from "./purchase-requisition-table-columns";

const CREATE_FORM_ID = "create-purchase-requisition-form";
const SEARCH_DEBOUNCE_MS = 300;
const PAGE_SIZE = 10;

export function PurchaseRequisitionList() {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const del = useDeletePurchaseRequisition();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const pagination = usePagination({ pageSize: PAGE_SIZE });

  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [searchInput]);

  const { data: result, isLoading, error, refetch } = usePurchaseRequisitions({
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
      getPurchaseRequisitionRowActions({
        onView: (r) => router.push(`/purchase-requisitions/${r.id}`),
        onEdit: (r) => router.push(`/purchase-requisitions/${r.id}/edit`),
        onDelete: async (r) => {
          const ok = await confirm({
            title: "Delete purchase requisition",
            description: `Delete requisition for ${r.department}? This cannot be undone.`,
            confirmLabel: "Delete",
            variant: "destructive",
          });
          if (ok) {
            del.mutate(String(r.id), {
              onSuccess: () => toast.success("Purchase requisition deleted."),
              onError: () => toast.error("Failed to delete purchase requisition."),
            });
          }
        },
      }),
    [router, confirm, del, toast]
  );

  const columns = useMemo(
    () =>
      getPurchaseRequisitionTableColumns({
        onView: (r) => router.push(`/purchase-requisitions/${r.id}`),
      }),
    [router],
  );

  return (
    <EntityListWithCreateModal<PurchaseRequisition>
      data={items}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      loadingText="Loading purchase requisitions..."
      emptyText={
        search ? "No purchase requisitions match your search." : "No purchase requisitions yet."
      }
      error={
        error
          ? {
              message: "Failed to load purchase requisitions.",
              onRetry: () => refetch(),
            }
          : undefined
      }
      topContent={
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search purchase requisitions..."
          />
        </div>
      }
      pageSize={PAGE_SIZE}
      currentPage={pagination.page}
      totalPages={result?.totalPages ?? pagination.getTotalPages(result?.total)}
      totalItems={result?.total ?? 0}
      onPageChange={pagination.setPage}
      addLabel="New Requisition"
      createTitle="Create Purchase Requisition"
      createSubmitText="Create Requisition"
      createLoadingText="Creating..."
      createFormId={CREATE_FORM_ID}
      createMaxWidth="2xl"
      renderCreateForm={({ formId, onSuccess, onLoadingChange }) => (
        <CreatePurchaseRequisitionForm
          formId={formId}
          onSuccess={onSuccess}
          onLoadingChange={onLoadingChange}
        />
      )}
    />
  );
}
