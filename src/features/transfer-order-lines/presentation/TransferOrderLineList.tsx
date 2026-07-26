"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { useToast } from "@/presentation/providers/ToastProvider";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import {
  useTransferOrderLines,
  useDeleteTransferOrderLine,
} from "@/presentation/hooks/useTransferOrderLines";
import { useTransferOrder } from "@/presentation/hooks/useTransferOrders";
import { useProducts } from "@/presentation/hooks/useProducts";
import { usePagination } from "@/presentation/hooks/usePagination";
import type { TransferOrderLine } from "@/core/domain/entities/TransferOrderLine";
import { getPaginatedItems } from "@/presentation/hooks/pagination";
import { CreateTransferOrderLineForm } from "./CreateTransferOrderLineForm";
import { getTransferOrderLineRowActions } from "./transfer-order-line-row-actions";
import { getTransferOrderLineTableColumns } from "./transfer-order-line-table-columns";

const CREATE_FORM_ID = "create-transfer-order-line-form";
const PAGE_SIZE = 10;

export interface TransferOrderLineListProps {
  transferOrderId: string;
  routeBasePath?: string;
}

export function TransferOrderLineList({
  transferOrderId,
  routeBasePath,
}: TransferOrderLineListProps) {
  const router = useRouter();
  const pagination = usePagination({ pageSize: PAGE_SIZE });
  useTransferOrder(transferOrderId);
  const { data: linesResult, isLoading, error, refetch } = useTransferOrderLines(
    transferOrderId,
    { page: pagination.page, limit: PAGE_SIZE, sortBy: "createdAt", sortOrder: "desc" }
  );
  const lines = linesResult?.items ?? [];
  const del = useDeleteTransferOrderLine(transferOrderId);
  const toast = useToast();
  const confirm = useConfirm();
  const { data: productsData } = useProducts({ page: 1, limit: 200 });
  const products = getPaginatedItems(productsData);

  const productNameById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const p of products) {
      map[String(p.id)] = p.name;
    }
    return map;
  }, [products]);

  const basePath = routeBasePath ?? `/transfer-order-lines/${transferOrderId}`;

  const actions = useMemo(
    () =>
      getTransferOrderLineRowActions({
        onView: (l) => router.push(`${basePath}/${l.id}`),
        onEdit: (l) => router.push(`${basePath}/${l.id}/edit`),
        onDelete: async (l) => {
          const ok = await confirm({
            title: "Delete transfer order line",
            description: "Delete this transfer order line? This cannot be undone.",
            confirmLabel: "Delete",
            variant: "destructive",
          });
          if (ok) {
            del.mutate(String(l.id), {
              onSuccess: () => toast.success("Transfer order line deleted."),
              onError: () => toast.error("Failed to delete transfer order line."),
            });
          }
        },
      }),
    [router, basePath, confirm, del, toast]
  );

  const columns = useMemo(
    () =>
      getTransferOrderLineTableColumns({
        onView: (l) => router.push(`${basePath}/${l.id}`),
        productNameById,
      }),
    [router, basePath, productNameById]
  );

  return (
    <EntityListWithCreateModal<TransferOrderLine>
      data={lines}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      loadingText="Loading transfer order lines..."
      emptyText="No transfer order lines yet."
      error={
        error
          ? {
              message: "Failed to load transfer order lines.",
              onRetry: () => refetch(),
            }
          : undefined
      }
      pageSize={PAGE_SIZE}
      currentPage={pagination.page}
      totalPages={linesResult?.totalPages ?? pagination.getTotalPages(linesResult?.total)}
      totalItems={linesResult?.total ?? 0}
      onPageChange={pagination.setPage}
      addLabel="New Line"
      createTitle="Create Transfer Order Line"
      createSubmitText="Create Line"
      createLoadingText="Creating..."
      createFormId={CREATE_FORM_ID}
      createMaxWidth="2xl"
      renderCreateForm={({ formId, onSuccess, onLoadingChange }) => (
        <CreateTransferOrderLineForm
          transferOrderId={transferOrderId}
          formId={formId}
          onSuccess={onSuccess}
          onLoadingChange={onLoadingChange}
        />
      )}
    />
  );
}
