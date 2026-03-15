"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useUoms, useDeleteUom } from "@/presentation/hooks/useUoms";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { Button } from "@/presentation/components/ui/button";
import { DataTable } from "@/presentation/components/data-table";
import { FormModal } from "@/presentation/components/modal/FormModal";
import { getUomRowActions } from "./uom-row-actions";
import { getUomTableColumns } from "./uom-table-columns";
import { CreateUomForm } from "./CreateUomForm";
import type { Uom } from "@/core/domain/entities/Uom";

const CREATE_UOM_FORM_ID = "create-uom-form";

export function UomList() {
  const router = useRouter();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createFormLoading, setCreateFormLoading] = useState(false);
  const { data: uoms = [], isLoading, error, refetch } = useUoms();
  const deleteUom = useDeleteUom();
  const toast = useToast();
  const confirm = useConfirm();

  const actions = useMemo(
    () =>
      getUomRowActions({
        onView: (u) => router.push(`/admin/uoms/${u.id}`),
        onEdit: (u) => router.push(`/admin/uoms/${u.id}/edit`),
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
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add UOM
        </Button>
      </div>
      <DataTable<Uom>
        data={uoms}
        columns={columns}
        actions={actions}
        isLoading={isLoading}
        loadingText="Loading UOMs..."
        emptyText="No UOMs yet."
        emptyAction={{
          label: "Add UOM",
          onClick: () => setCreateModalOpen(true),
        }}
        error={
          error
            ? {
                message: "Failed to load UOMs.",
                onRetry: () => refetch(),
              }
            : undefined
        }
        pageSize={10}
      />
      <FormModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create UOM"
        formId={CREATE_UOM_FORM_ID}
        formContent={
          <CreateUomForm
            formId={CREATE_UOM_FORM_ID}
            onSuccess={() => setCreateModalOpen(false)}
            onLoadingChange={setCreateFormLoading}
          />
        }
        submitText="Create UOM"
        loadingText="Creating..."
        isLoading={createFormLoading}
        maxWidth="md"
      />
    </>
  );
}
