"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useUoms, useDeleteUom } from "@/presentation/hooks/useUoms";
import { useInferredServerPagination } from "@/presentation/hooks/useInferredServerPagination";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import { getUomRowActions } from "./uom-row-actions";
import { getUomTableColumns } from "./uom-table-columns";
import { CreateUomForm } from "./CreateUomForm";
import type { Uom } from "@/core/domain/entities/Uom";

const CREATE_UOM_FORM_ID = "create-uom-form";
const PAGE_SIZE = 10;

export function UomList() {
  const router = useRouter();
  const pagination = useInferredServerPagination({ pageSize: PAGE_SIZE });
  const { data: uoms = [], isLoading, error, refetch } = useUoms({
    page: pagination.page,
    limit: PAGE_SIZE,
  });
  const deleteUom = useDeleteUom();
  const toast = useToast();
  const confirm = useConfirm();

  useEffect(() => {
    pagination.observePageResult(uoms.length);
  }, [uoms.length, pagination]);

  const actions = useMemo(
    () =>
      getUomRowActions({
        onView: (u) => router.push(`/uoms/${u.id}`),
        onEdit: (u) => router.push(`/uoms/${u.id}/edit`),
        onDelete: async (u) => {
          const ok = await confirm({
            title: "Delete UOM",
            description: `Delete "${u.name}" (${u.abbreviation})? This cannot be undone.`,
            confirmLabel: "Delete",
            variant: "destructive",
          });
          if (ok) {
            deleteUom.mutate(u.id, {
              onSuccess: () => toast.success("UOM deleted."),
              onError: () => toast.error("Failed to delete UOM."),
            });
          }
        },
      }),
    [router, deleteUom, toast, confirm]
  );

  const columns = useMemo(() => getUomTableColumns(), []);

  return (
    <EntityListWithCreateModal<Uom>
      data={uoms}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      loadingText="Loading UOMs..."
      emptyText="No UOMs yet."
      error={
        error
          ? {
              message: "Failed to load UOMs.",
              onRetry: () => refetch(),
            }
          : undefined
      }
      pageSize={10}
      currentPage={pagination.page}
      totalPages={pagination.totalPages}
      totalItems={pagination.totalItems}
      onPageChange={(p) => pagination.setPage(p)}
      addLabel="Add UOM"
      createTitle="Create UOM"
      createSubmitText="Create UOM"
      createLoadingText="Creating..."
      createFormId={CREATE_UOM_FORM_ID}
      createMaxWidth="md"
      renderCreateForm={({ formId, onSuccess, onLoadingChange }) => (
        <CreateUomForm
          formId={formId}
          onSuccess={onSuccess}
          onLoadingChange={onLoadingChange}
        />
      )}
    />
  );
}
