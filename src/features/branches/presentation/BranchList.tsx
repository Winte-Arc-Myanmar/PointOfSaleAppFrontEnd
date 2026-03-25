"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useBranches, useDeleteBranch } from "@/presentation/hooks/useBranches";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { Button } from "@/presentation/components/ui/button";
import { DataTable } from "@/presentation/components/data-table";
import { FormModal } from "@/presentation/components/modal/FormModal";
import { getBranchRowActions } from "./branch-row-actions";
import { getBranchTableColumns } from "./branch-table-columns";
import { CreateBranchForm } from "./CreateBranchForm";
import type { Branch } from "@/core/domain/entities/Branch";

const CREATE_BRANCH_FORM_ID = "create-branch-form";

export function BranchList() {
  const router = useRouter();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createFormLoading, setCreateFormLoading] = useState(false);
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
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Branch
        </Button>
      </div>
      <DataTable<Branch>
        data={branches}
        columns={columns}
        actions={actions}
        isLoading={isLoading}
        loadingText="Loading branches..."
        emptyText="No branches yet."
        emptyAction={{
          label: "Add Branch",
          onClick: () => setCreateModalOpen(true),
        }}
        error={
          error
            ? {
                message: "Failed to load branches.",
                onRetry: () => refetch(),
              }
            : undefined
        }
        pageSize={10}
      />
      <FormModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Branch"
        formId={CREATE_BRANCH_FORM_ID}
        formContent={
          <CreateBranchForm
            formId={CREATE_BRANCH_FORM_ID}
            onSuccess={() => setCreateModalOpen(false)}
            onLoadingChange={setCreateFormLoading}
          />
        }
        submitText="Create Branch"
        loadingText="Creating..."
        isLoading={createFormLoading}
        maxWidth="2xl"
      />
    </>
  );
}
