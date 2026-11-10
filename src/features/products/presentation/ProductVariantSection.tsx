"use client";

import { useMemo, useState } from "react";
import { useProductVariants, useDeleteProductVariant } from "@/presentation/hooks/useProductVariants";
import { usePagination } from "@/presentation/hooks/usePagination";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { FormModal } from "@/presentation/components/modal/FormModal";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import { getVariantRowActions } from "./variant-row-actions";
import { getVariantTableColumns } from "./variant-table-columns";
import { VariantForm, type VariantProduct } from "./VariantForm";
import { variantName } from "./variant-name";
import type { ProductVariant } from "@/core/domain/entities/ProductVariant";

const CREATE_VARIANT_FORM_ID = "create-variant-form";
const EDIT_VARIANT_FORM_ID = "edit-variant-form";
const PAGE_SIZE = 10;

export function ProductVariantSection({ product }: { product: VariantProduct }) {
  const productId = product.id;
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const [editFormLoading, setEditFormLoading] = useState(false);

  const pagination = usePagination({ pageSize: PAGE_SIZE });
  const { data: variantsResult, isLoading, error, refetch } = useProductVariants(productId, {
    page: pagination.page,
    limit: PAGE_SIZE,
  });
  const variants = variantsResult?.items ?? [];
  const deleteVariant = useDeleteProductVariant(productId);
  const toast = useToast();
  const confirm = useConfirm();

  const actions = useMemo(
    () =>
      getVariantRowActions({
        onEdit: (v) => {
          setEditingVariant(v);
          setEditModalOpen(true);
        },
        onDelete: async (v) => {
          const ok = await confirm({
            title: "Delete variant",
            description: `Delete "${variantName(v)}" from ${product.name}? This cannot be undone.`,
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
    [deleteVariant, toast, confirm, product.name]
  );

  const columns = useMemo(
    () => getVariantTableColumns(product.basePrice),
    [product.basePrice],
  );

  return (
    <>
      <EntityListWithCreateModal<ProductVariant>
        sectionTitle="Variants"
        data={variants}
        columns={columns}
        actions={actions}
        isLoading={isLoading}
        loadingText="Loading variants..."
        emptyText="No variants yet. A product with one variant shows on the POS as just its name."
        error={
          error
            ? {
                message: "Failed to load variants.",
                onRetry: () => refetch(),
              }
            : undefined
        }
        pageSize={PAGE_SIZE}
        currentPage={pagination.page}
        totalPages={variantsResult?.totalPages ?? pagination.getTotalPages(variantsResult?.total)}
        totalItems={variantsResult?.total ?? 0}
        onPageChange={pagination.setPage}
        addLabel="Add variant"
        createTitle={`Add variant · ${product.name}`}
        createSubmitText="Save"
        createLoadingText="Saving..."
        createFormId={CREATE_VARIANT_FORM_ID}
        createMaxWidth="lg"
        renderCreateForm={({ formId, onSuccess, onLoadingChange }) => (
          <VariantForm
            product={product}
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
          setEditingVariant(null);
        }}
        title={editingVariant ? `Edit ${variantName(editingVariant)} · ${product.name}` : "Edit variant"}
        formId={EDIT_VARIANT_FORM_ID}
        formContent={
          editingVariant ? (
            <VariantForm
              key={String(editingVariant.id)}
              product={product}
              variant={editingVariant}
              formId={EDIT_VARIANT_FORM_ID}
              onSuccess={() => {
                setEditModalOpen(false);
                setEditingVariant(null);
              }}
              onLoadingChange={setEditFormLoading}
            />
          ) : null
        }
        submitText="Save"
        loadingText="Saving..."
        isLoading={editFormLoading}
        maxWidth="lg"
      />
    </>
  );
}
