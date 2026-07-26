"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/presentation/components/ui/input";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { useToast } from "@/presentation/providers/ToastProvider";
import { usePagination } from "@/presentation/hooks/usePagination";
import {
  useTransferOrders,
  useDeleteTransferOrder,
} from "@/presentation/hooks/useTransferOrders";
import type { TransferOrder } from "@/core/domain/entities/TransferOrder";
import { CreateTransferOrderForm } from "./CreateTransferOrderForm";
import { getTransferOrderRowActions } from "./transfer-order-row-actions";
import { getTransferOrderTableColumns } from "./transfer-order-table-columns";

const CREATE_FORM_ID = "create-transfer-order-form";
const SEARCH_DEBOUNCE_MS = 300;
const PAGE_SIZE = 10;

export function TransferOrderList() {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const del = useDeleteTransferOrder();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const pagination = usePagination({ pageSize: PAGE_SIZE });

  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [searchInput]);

  const { data: ordersResult, isLoading, error, refetch } = useTransferOrders({
    search: search || undefined,
    page: pagination.page,
    limit: PAGE_SIZE,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const orders = ordersResult?.items ?? [];

  useEffect(() => {
    pagination.reset(1);
  }, [search, pagination.reset]);

  const actions = useMemo(
    () =>
      getTransferOrderRowActions({
        onView: (o) => router.push(`/transfer-orders/${o.id}`),
        onEdit: (o) => router.push(`/transfer-orders/${o.id}/edit`),
        onDelete: async (o) => {
          const ok = await confirm({
            title: "Delete transfer order",
            description: `Delete transfer ${o.transferNumber}? This cannot be undone.`,
            confirmLabel: "Delete",
            variant: "destructive",
          });
          if (ok) {
            del.mutate(String(o.id), {
              onSuccess: () => toast.success("Transfer order deleted."),
              onError: () => toast.error("Failed to delete transfer order."),
            });
          }
        },
      }),
    [router, confirm, del, toast]
  );

  const columns = useMemo(
    () =>
      getTransferOrderTableColumns({
        onView: (o) => router.push(`/transfer-orders/${o.id}`),
      }),
    [router],
  );

  return (
    <EntityListWithCreateModal<TransferOrder>
      data={orders}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      loadingText="Loading transfer orders..."
      emptyText={search ? "No transfer orders match your search." : "No transfer orders yet."}
      error={
        error
          ? {
              message: "Failed to load transfer orders.",
              onRetry: () => refetch(),
            }
          : undefined
      }
      topContent={
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search transfer orders..."
          />
        </div>
      }
      pageSize={PAGE_SIZE}
      currentPage={pagination.page}
      totalPages={
        ordersResult?.totalPages ?? pagination.getTotalPages(ordersResult?.total)
      }
      totalItems={ordersResult?.total ?? 0}
      onPageChange={pagination.setPage}
      addLabel="New Transfer Order"
      createTitle="Create Transfer Order"
      createSubmitText="Create Transfer Order"
      createLoadingText="Creating..."
      createFormId={CREATE_FORM_ID}
      createMaxWidth="2xl"
      renderCreateForm={({ formId, onSuccess, onLoadingChange }) => (
        <CreateTransferOrderForm
          formId={formId}
          onSuccess={onSuccess}
          onLoadingChange={onLoadingChange}
        />
      )}
    />
  );
}
