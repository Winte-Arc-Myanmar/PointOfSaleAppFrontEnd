"use client";

import { useMemo, useState } from "react";
import { useProductVariants, useDeleteProductVariant } from "@/presentation/hooks/useProductVariants";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { FormModal } from "@/presentation/components/modal/FormModal";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import { getVariantRowActions } from "./variant-row-actions";
import { getVariantTableColumns } from "./variant-table-columns";
import { CreateVariantForm } from "./CreateVariantForm";
import { EditVariantForm } from "./EditVariantForm";
import type { ProductVariant } from "@/core/domain/entities/ProductVariant";

const CREATE_VARIANT_FORM_ID = "create-variant-form";
const EDIT_VARIANT_FORM_ID = "edit-variant-form";

export function ProductVariantSection({ productId }: { productId: string }) {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
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
      <EntityListWithCreateModal<ProductVariant>
        sectionTitle="Variants"
        data={variants}
        columns={columns}
        actions={actions}
        isLoading={isLoading}
        loadingText="Loading variants..."
        emptyText="No variants yet."
        error={
          error
            ? {
                message: "Failed to load variants.",
                onRetry: () => refetch(),
              }
            : undefined
        }
        pageSize={10}
        addLabel="Add Variant"
        createTitle="Create Variant"
        createSubmitText="Create Variant"
        createLoadingText="Creating..."
        createFormId={CREATE_VARIANT_FORM_ID}
        createMaxWidth="lg"
        renderCreateForm={({ formId, onSuccess, onLoadingChange }) => (
          <CreateVariantForm
            productId={productId}
            formId={formId}
            onSuccess={onSuccess}
            onLoadingChange={onLoadingChange}
          />
        )}
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
