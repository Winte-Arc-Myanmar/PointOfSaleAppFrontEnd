"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { useToast } from "@/presentation/providers/ToastProvider";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import {
  useGrnLines,
  useDeleteGrnLine,
} from "@/presentation/hooks/useGrnLines";
import { useGoodsReceivedNote } from "@/presentation/hooks/useGoodsReceivedNotes";
import { useProducts } from "@/presentation/hooks/useProducts";
import { usePagination } from "@/presentation/hooks/usePagination";
import type { GrnLine } from "@/core/domain/entities/GrnLine";
import { getPaginatedItems } from "@/presentation/hooks/pagination";
import { CreateGrnLineForm } from "./CreateGrnLineForm";
import { getGrnLineRowActions } from "./grn-line-row-actions";
import { getGrnLineTableColumns } from "./grn-line-table-columns";

const CREATE_FORM_ID = "create-grn-line-form";
const PAGE_SIZE = 10;

export interface GrnLineListProps {
  grnId: string;
  routeBasePath?: string;
}

export function GrnLineList({
  grnId,
  routeBasePath,
}: GrnLineListProps) {
  const router = useRouter();
  const pagination = usePagination({ pageSize: PAGE_SIZE });
  useGoodsReceivedNote(grnId);
  const { data: linesResult, isLoading, error, refetch } = useGrnLines(
    grnId,
    { page: pagination.page, limit: PAGE_SIZE, sortBy: "createdAt", sortOrder: "desc" }
  );
  const lines = linesResult?.items ?? [];
  const del = useDeleteGrnLine(grnId);
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

  const basePath = routeBasePath ?? `/grn-lines/${grnId}`;

  const actions = useMemo(
    () =>
      getGrnLineRowActions({
        onView: (l) => router.push(`${basePath}/${l.id}`),
        onEdit: (l) => router.push(`${basePath}/${l.id}/edit`),
        onDelete: async (l) => {
          const ok = await confirm({
            title: "Delete GRN line",
            description: "Delete this GRN line? This cannot be undone.",
            confirmLabel: "Delete",
            variant: "destructive",
          });
          if (ok) {
            del.mutate(String(l.id), {
              onSuccess: () => toast.success("GRN line deleted."),
              onError: () => toast.error("Failed to delete GRN line."),
            });
          }
        },
      }),
    [router, basePath, confirm, del, toast]
  );

  const columns = useMemo(
    () =>
      getGrnLineTableColumns({
        onView: (l) => router.push(`${basePath}/${l.id}`),
        productNameById,
      }),
    [router, basePath, productNameById]
  );

  return (
    <EntityListWithCreateModal<GrnLine>
      data={lines}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      loadingText="Loading GRN lines..."
      emptyText="No GRN lines yet."
      error={
        error
          ? {
              message: "Failed to load GRN lines.",
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
      createTitle="Create GRN Line"
      createSubmitText="Create Line"
      createLoadingText="Creating..."
      createFormId={CREATE_FORM_ID}
      createMaxWidth="2xl"
      renderCreateForm={({ formId, onSuccess, onLoadingChange }) => (
        <CreateGrnLineForm
          grnId={grnId}
          formId={formId}
          onSuccess={onSuccess}
          onLoadingChange={onLoadingChange}
        />
      )}
    />
  );
}
