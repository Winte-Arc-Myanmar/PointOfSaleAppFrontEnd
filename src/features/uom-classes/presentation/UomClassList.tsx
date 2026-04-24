"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useUomClasses, useDeleteUomClass } from "@/presentation/hooks/useUomClasses";
import { useInferredServerPagination } from "@/presentation/hooks/useInferredServerPagination";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import { getUomClassRowActions } from "./uom-class-row-actions";
import { getUomClassTableColumns } from "./uom-class-table-columns";
import { CreateUomClassForm } from "./CreateUomClassForm";
import type { UomClass } from "@/core/domain/entities/UomClass";

const CREATE_UOM_CLASS_FORM_ID = "create-uom-class-form";
const PAGE_SIZE = 10;

export function UomClassList() {
  const router = useRouter();
  const pagination = useInferredServerPagination({ pageSize: PAGE_SIZE });
  const { data: uomClasses = [], isLoading, error, refetch } = useUomClasses({
    page: pagination.page,
    limit: PAGE_SIZE,
  });
  const deleteUomClass = useDeleteUomClass();
  const toast = useToast();
  const confirm = useConfirm();

  useEffect(() => {
    pagination.observePageResult(uomClasses.length);
  }, [uomClasses.length, pagination]);

  const actions = useMemo(
    () =>
      getUomClassRowActions({
        onView: (c) => router.push(`/uom-classes/${c.id}`),
        onEdit: (c) => router.push(`/uom-classes/${c.id}/edit`),
        onDelete: async (c) => {
          const ok = await confirm({
            title: "Delete UOM class",
            description: `Delete "${c.name}"? This cannot be undone.`,
            confirmLabel: "Delete",
            variant: "destructive",
          });
          if (ok) {
            deleteUomClass.mutate(c.id, {
              onSuccess: () => toast.success("UOM class deleted."),
              onError: () => toast.error("Failed to delete UOM class."),
            });
          }
        },
      }),
    [router, deleteUomClass, toast, confirm]
  );

  const columns = useMemo(() => getUomClassTableColumns(), []);

  return (
    <EntityListWithCreateModal<UomClass>
      data={uomClasses}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      loadingText="Loading UOM classes..."
      emptyText="No UOM classes yet."
      error={
        error
          ? {
              message: "Failed to load UOM classes.",
              onRetry: () => refetch(),
            }
          : undefined
      }
      pageSize={10}
      currentPage={pagination.page}
      totalPages={pagination.totalPages}
      totalItems={pagination.totalItems}
      onPageChange={(p) => pagination.setPage(p)}
      addLabel="Add UOM Class"
      createTitle="Create UOM Class"
      createSubmitText="Create UOM Class"
      createLoadingText="Creating..."
      createFormId={CREATE_UOM_CLASS_FORM_ID}
      createMaxWidth="md"
      renderCreateForm={({ formId, onSuccess, onLoadingChange }) => (
        <CreateUomClassForm
          formId={formId}
          onSuccess={onSuccess}
          onLoadingChange={onLoadingChange}
        />
      )}
    />
  );
}
