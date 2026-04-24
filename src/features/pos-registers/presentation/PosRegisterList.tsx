"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useDeletePosRegister, usePosRegisters } from "@/presentation/hooks/usePosRegisters";
import { useInferredServerPagination } from "@/presentation/hooks/useInferredServerPagination";
import type { PosRegister } from "@/core/domain/entities/PosRegister";
import { CreatePosRegisterForm } from "./CreatePosRegisterForm";
import { getPosRegisterRowActions } from "./pos-register-row-actions";
import { getPosRegisterTableColumns } from "./pos-register-table-columns";

const CREATE_FORM_ID = "create-pos-register-form";
const PAGE_SIZE = 10;

export function PosRegisterList() {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const del = useDeletePosRegister();
  const pagination = useInferredServerPagination({ pageSize: PAGE_SIZE });

  const { data: registers = [], isLoading, error, refetch } = usePosRegisters({
    page: pagination.page,
    limit: PAGE_SIZE,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  useEffect(() => {
    pagination.observePageResult(registers.length);
  }, [registers.length, pagination]);

  const actions = useMemo(
    () =>
      getPosRegisterRowActions({
        onView: (r) => router.push(`/pos-registers/${r.id}`),
        onEdit: (r) => router.push(`/pos-registers/${r.id}/edit`),
        onDelete: async (r) => {
          const ok = await confirm({
            title: "Delete POS register",
            description: `Delete "${r.name}"? This cannot be undone.`,
            confirmLabel: "Delete",
            variant: "destructive",
          });
          if (ok) {
            del.mutate(String(r.id), {
              onSuccess: () => toast.success("POS register deleted."),
              onError: () => toast.error("Failed to delete POS register."),
            });
          }
        },
      }),
    [router, confirm, del, toast]
  );

  const columns = useMemo(() => getPosRegisterTableColumns(), []);

  return (
    <EntityListWithCreateModal<PosRegister>
      data={registers}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      loadingText="Loading POS registers..."
      emptyText="No POS registers yet."
      error={
        error
          ? {
              message: "Failed to load POS registers.",
              onRetry: () => refetch(),
            }
          : undefined
      }
      pageSize={10}
      currentPage={pagination.page}
      totalPages={pagination.totalPages}
      totalItems={pagination.totalItems}
      onPageChange={(p) => pagination.setPage(p)}
      addLabel="New Register"
      createTitle="Create POS Register"
      createSubmitText="Create Register"
      createLoadingText="Creating..."
      createFormId={CREATE_FORM_ID}
      createMaxWidth="2xl"
      renderCreateForm={({ formId, onSuccess, onLoadingChange }) => (
        <CreatePosRegisterForm
          formId={formId}
          onSuccess={onSuccess}
          onLoadingChange={onLoadingChange}
        />
      )}
    />
  );
}

