"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useUomClasses, useDeleteUomClass } from "@/presentation/hooks/useUomClasses";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { Button } from "@/presentation/components/ui/button";
import { DataTable } from "@/presentation/components/data-table";
import { FormModal } from "@/presentation/components/modal/FormModal";
import { getUomClassRowActions } from "./uom-class-row-actions";
import { getUomClassTableColumns } from "./uom-class-table-columns";
import { CreateUomClassForm } from "./CreateUomClassForm";
import type { UomClass } from "@/core/domain/entities/UomClass";

const CREATE_UOM_CLASS_FORM_ID = "create-uom-class-form";

export function UomClassList() {
  const router = useRouter();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createFormLoading, setCreateFormLoading] = useState(false);
  const { data: uomClasses = [], isLoading, error, refetch } = useUomClasses();
  const deleteUomClass = useDeleteUomClass();
  const toast = useToast();
  const confirm = useConfirm();

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
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add UOM Class
        </Button>
      </div>
      <DataTable<UomClass>
        data={uomClasses}
        columns={columns}
        actions={actions}
        isLoading={isLoading}
        loadingText="Loading UOM classes..."
        emptyText="No UOM classes yet."
        emptyAction={{
          label: "Add UOM Class",
          onClick: () => setCreateModalOpen(true),
        }}
        error={
          error
            ? {
                message: "Failed to load UOM classes.",
                onRetry: () => refetch(),
              }
            : undefined
        }
        pageSize={10}
      />
      <FormModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create UOM Class"
        formId={CREATE_UOM_CLASS_FORM_ID}
        formContent={
          <CreateUomClassForm
            formId={CREATE_UOM_CLASS_FORM_ID}
            onSuccess={() => setCreateModalOpen(false)}
            onLoadingChange={setCreateFormLoading}
          />
        }
        submitText="Create UOM Class"
        loadingText="Creating..."
        isLoading={createFormLoading}
        maxWidth="md"
      />
    </>
  );
}
