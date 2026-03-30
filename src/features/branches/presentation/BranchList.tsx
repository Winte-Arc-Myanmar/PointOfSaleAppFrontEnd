"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useBranches, useDeleteBranch } from "@/presentation/hooks/useBranches";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import { getBranchRowActions } from "./branch-row-actions";
import { getBranchTableColumns } from "./branch-table-columns";
import { CreateBranchForm } from "./CreateBranchForm";
import type { Branch } from "@/core/domain/entities/Branch";

const CREATE_BRANCH_FORM_ID = "create-branch-form";

export function BranchList() {
  const router = useRouter();
  const { data: branches = [], isLoading, error, refetch } = useBranches();
  const deleteBranch = useDeleteBranch();
  const toast = useToast();
  const confirm = useConfirm();

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
