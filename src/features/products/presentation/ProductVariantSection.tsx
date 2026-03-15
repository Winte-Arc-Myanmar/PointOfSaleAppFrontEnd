"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useProductVariants, useDeleteProductVariant } from "@/presentation/hooks/useProductVariants";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { Button } from "@/presentation/components/ui/button";
import { DataTable } from "@/presentation/components/data-table";
import { FormModal } from "@/presentation/components/modal/FormModal";
import { getVariantRowActions } from "./variant-row-actions";
import { getVariantTableColumns } from "./variant-table-columns";
import { CreateVariantForm } from "./CreateVariantForm";
import { EditVariantForm } from "./EditVariantForm";
import type { ProductVariant } from "@/core/domain/entities/ProductVariant";

const CREATE_VARIANT_FORM_ID = "create-variant-form";
const EDIT_VARIANT_FORM_ID = "edit-variant-form";

export function ProductVariantSection({ productId }: { productId: string }) {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
  const [createFormLoading, setCreateFormLoading] = useState(false);
  const [editFormLoading, setEditFormLoading] = useState(false);

  const { data: variants = [], isLoading, error, refetch } = useProductVariants(productId);
  const deleteVariant = useDeleteProductVariant(productId);
  const toast = useToast();
  const confirm = useConfirm();

  const actions = useMemo(
    () =>
      getVariantRowActions({
        onEdit: (v) => {
          setEditingVariantId(v.id);
          setEditModalOpen(true);
        },
        onDelete: async (v) => {
          const ok = await confirm({
            title: "Delete variant",
            description: `Delete "${v.variantSku}"? This cannot be undone.`,
            confirmLabel: "Delete",
            variant: "destructive",
          });
          if (ok) {
            deleteVariant.mutate(v.id, {
              onSuccess: () => toast.success("Variant deleted."),
              onError: () => toast.error("Failed to delete variant."),
            });
          }
        },
      }),
    [deleteVariant, toast, confirm]
  );

  const columns = useMemo(() => getVariantTableColumns(), []);

  return (
    <>
      <section>
        <h2 className="section-label mb-4">
          Variants
        </h2>
        <div className="mb-4 flex justify-end">
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Variant
          </Button>
        </div>
        <DataTable<ProductVariant>
          data={variants}
          columns={columns}
          actions={actions}
          isLoading={isLoading}
          loadingText="Loading variants..."
          emptyText="No variants yet."
          emptyAction={{
            label: "Add Variant",
            onClick: () => setCreateModalOpen(true),
          }}
          error={
            error
              ? {
                  message: "Failed to load variants.",
                  onRetry: () => refetch(),
                }
              : undefined
          }
          pageSize={10}
        />
      </section>
      <FormModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Variant"
        formId={CREATE_VARIANT_FORM_ID}
        formContent={
          <CreateVariantForm
            productId={productId}
            formId={CREATE_VARIANT_FORM_ID}
            onSuccess={() => setCreateModalOpen(false)}
            onLoadingChange={setCreateFormLoading}
          />
        }
        submitText="Create Variant"
        loadingText="Creating..."
        isLoading={createFormLoading}
        maxWidth="lg"
      />
      <FormModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditingVariantId(null);
        }}
        title="Edit Variant"
        formId={EDIT_VARIANT_FORM_ID}
        formContent={
          editingVariantId ? (
            <EditVariantForm
              productId={productId}
              variantId={editingVariantId}
              formId={EDIT_VARIANT_FORM_ID}
              onSuccess={() => {
                setEditModalOpen(false);
                setEditingVariantId(null);
              }}
              onLoadingChange={setEditFormLoading}
            />
          ) : null
        }
        submitText="Save changes"
        loadingText="Saving..."
        isLoading={editFormLoading}
        maxWidth="lg"
      />
    </>
  );
}
