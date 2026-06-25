"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/presentation/components/ui/input";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { useToast } from "@/presentation/providers/ToastProvider";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import { useDeleteSalesOrder, useSalesOrders } from "@/presentation/hooks/useSalesOrders";
import { usePagination } from "@/presentation/hooks/usePagination";
import type { SalesOrder } from "@/core/domain/entities/SalesOrder";
import { CreateSalesOrderForm } from "./CreateSalesOrderForm";
import { getSalesOrderRowActions } from "./sales-order-row-actions";
import { getSalesOrderTableColumns } from "./sales-order-table-columns";

const CREATE_FORM_ID = "create-sales-order-form";
const SEARCH_DEBOUNCE_MS = 300;
const PAGE_SIZE = 10;

export function SalesOrderList() {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const del = useDeleteSalesOrder();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const pagination = usePagination({ pageSize: PAGE_SIZE });

  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [searchInput]);

  const { data: ordersResult, isLoading, error, refetch } = useSalesOrders({
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
      getSalesOrderRowActions({
        onView: (o) => router.push(`/sales-orders/${o.id}`),
        onEdit: (o) => router.push(`/sales-orders/${o.id}/edit`),
        onDelete: async (o) => {
          const ok = await confirm({
            title: "Delete sales order",
            description: `Delete "${o.orderNumber}"? This cannot be undone.`,
            confirmLabel: "Delete",
            variant: "destructive",
          });
          if (ok) {
            del.mutate(String(o.id), {
              onSuccess: () => toast.success("Sales order deleted."),
              onError: () => toast.error("Failed to delete sales order."),
            });
          }
        },
      }),
    [router, confirm, del, toast]
  );

  const columns = useMemo(
    () =>
      getSalesOrderTableColumns({
        onView: (o) => router.push(`/sales-orders/${o.id}`),
      }),
    [router],
  );

  return (
    <EntityListWithCreateModal<SalesOrder>
      data={orders}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      loadingText="Loading sales orders..."
      emptyText={search ? "No sales orders match your search." : "No sales orders yet."}
      error={
        error
          ? {
              message: "Failed to load sales orders.",
              onRetry: () => refetch(),
            }
          : undefined
      }
      topContent={
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by order number, customer..."
          />
        </div>
      }
      pageSize={PAGE_SIZE}
      currentPage={pagination.page}
      totalPages={ordersResult?.totalPages ?? pagination.getTotalPages(ordersResult?.total)}
      totalItems={ordersResult?.total ?? 0}
      onPageChange={pagination.setPage}
      addLabel="New Sales Order"
      createTitle="Create Sales Order"
      createSubmitText="Create Sales Order"
      createLoadingText="Creating..."
      createFormId={CREATE_FORM_ID}
      createMaxWidth="2xl"
      renderCreateForm={({ formId, onSuccess, onLoadingChange }) => (
        <CreateSalesOrderForm
          formId={formId}
          onSuccess={onSuccess}
          onLoadingChange={onLoadingChange}
        />
      )}
    />
  );
}

