"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/presentation/components/ui/input";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { useToast } from "@/presentation/providers/ToastProvider";
import { usePagination } from "@/presentation/hooks/usePagination";
import {
  usePurchaseOrders,
  useDeletePurchaseOrder,
} from "@/presentation/hooks/usePurchaseOrders";
import type { PurchaseOrder } from "@/core/domain/entities/PurchaseOrder";
import { CreatePurchaseOrderForm } from "./CreatePurchaseOrderForm";
import { getPurchaseOrderRowActions } from "./purchase-order-row-actions";
import { getPurchaseOrderTableColumns } from "./purchase-order-table-columns";

const CREATE_FORM_ID = "create-purchase-order-form";
const SEARCH_DEBOUNCE_MS = 300;
const PAGE_SIZE = 10;

export function PurchaseOrderList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRequisitionId = searchParams.get("requisitionId") ?? undefined;
  const toast = useToast();
  const confirm = useConfirm();
  const del = useDeletePurchaseOrder();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const pagination = usePagination({ pageSize: PAGE_SIZE });

  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [searchInput]);

  const { data: result, isLoading, error, refetch } = usePurchaseOrders({
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
      getPurchaseOrderRowActions({
        onView: (o) => router.push(`/purchase-orders/${o.id}`),
        onEdit: (o) => router.push(`/purchase-orders/${o.id}/edit`),
        onDelete: async (o) => {
          const ok = await confirm({
            title: "Delete purchase order",
            description: `Delete PO ${o.poNumber}? This cannot be undone.`,
            confirmLabel: "Delete",
            variant: "destructive",
          });
          if (ok) {
            del.mutate(String(o.id), {
              onSuccess: () => toast.success("Purchase order deleted."),
              onError: () => toast.error("Failed to delete purchase order."),
            });
          }
        },
      }),
    [router, confirm, del, toast]
  );

  const columns = useMemo(
    () =>
      getPurchaseOrderTableColumns({
        onView: (o) => router.push(`/purchase-orders/${o.id}`),
      }),
    [router],
  );

  return (
    <EntityListWithCreateModal<PurchaseOrder>
      data={items}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      loadingText="Loading purchase orders..."
      emptyText={search ? "No purchase orders match your search." : "No purchase orders yet."}
      error={
        error
          ? {
              message: "Failed to load purchase orders.",
              onRetry: () => refetch(),
            }
          : undefined
      }
      topContent={
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search purchase orders..."
          />
        </div>
      }
      pageSize={PAGE_SIZE}
      currentPage={pagination.page}
      totalPages={result?.totalPages ?? pagination.getTotalPages(result?.total)}
      totalItems={result?.total ?? 0}
      onPageChange={pagination.setPage}
      addLabel="New Purchase Order"
      createTitle="Create Purchase Order"
      createSubmitText="Create Purchase Order"
      createLoadingText="Creating..."
      createFormId={CREATE_FORM_ID}
      createMaxWidth="2xl"
      renderCreateForm={({ formId, onSuccess, onLoadingChange }) => (
        <CreatePurchaseOrderForm
          formId={formId}
          onSuccess={onSuccess}
          onLoadingChange={onLoadingChange}
          defaultRequisitionId={defaultRequisitionId}
        />
      )}
    />
  );
}
