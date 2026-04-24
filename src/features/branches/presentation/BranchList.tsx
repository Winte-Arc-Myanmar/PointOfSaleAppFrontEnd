"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useBranches, useDeleteBranch } from "@/presentation/hooks/useBranches";
import { useInferredServerPagination } from "@/presentation/hooks/useInferredServerPagination";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import { getBranchRowActions } from "./branch-row-actions";
import { getBranchTableColumns } from "./branch-table-columns";
import { CreateBranchForm } from "./CreateBranchForm";
import type { Branch } from "@/core/domain/entities/Branch";

const CREATE_BRANCH_FORM_ID = "create-branch-form";
const PAGE_SIZE = 10;

export function BranchList() {
  const router = useRouter();
  const pagination = useInferredServerPagination({ pageSize: PAGE_SIZE });
  const { data: branches = [], isLoading, error, refetch } = useBranches({
    page: pagination.page,
    limit: PAGE_SIZE,
  });
  const deleteBranch = useDeleteBranch();
  const toast = useToast();
  const confirm = useConfirm();

  useEffect(() => {
    pagination.observePageResult(branches.length);
  }, [branches.length, pagination]);

  const actions = useMemo(
    () =>
      getBranchRowActions({
        onView: (b) => router.push(`/branches/${b.id}`),
        onEdit: (b) => router.push(`/branches/${b.id}/edit`),
        onDelete: async (b) => {
          const ok = await confirm({
            title: "Delete branch",
            description: `Delete "${b.name}"? This cannot be undone.`,
            confirmLabel: "Delete",
            variant: "destructive",
          });
          if (ok) {
            deleteBranch.mutate(b.id, {
              onSuccess: () => toast.success("Branch deleted."),
              onError: () => toast.error("Failed to delete branch."),
            });
          }
        },
      }),
    [router, deleteBranch, toast, confirm]
  );

  const columns = useMemo(() => getBranchTableColumns(), []);

  return (
    <EntityListWithCreateModal<Branch>
      data={branches}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      loadingText="Loading branches..."
      emptyText="No branches yet."
      error={
        error
          ? {
              message: "Failed to load branches.",
              onRetry: () => refetch(),
            }
          : undefined
      }
      pageSize={10}
      currentPage={pagination.page}
      totalPages={pagination.totalPages}
      totalItems={pagination.totalItems}
      onPageChange={(p) => pagination.setPage(p)}
      addLabel="Add Branch"
      createTitle="Create Branch"
      createSubmitText="Create Branch"
      createLoadingText="Creating..."
      createFormId={CREATE_BRANCH_FORM_ID}
      createMaxWidth="2xl"
      renderCreateForm={({ formId, onSuccess, onLoadingChange }) => (
        <CreateBranchForm
          formId={formId}
          onSuccess={onSuccess}
          onLoadingChange={onLoadingChange}
        />
      )}
    />
  );
}
