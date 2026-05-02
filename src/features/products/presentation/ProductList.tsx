"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  useProducts,
  useDeleteProduct,
} from "@/presentation/hooks/useProducts";
import { useInferredServerPagination } from "@/presentation/hooks/useInferredServerPagination";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import { getProductRowActions } from "./product-row-actions";
import { getProductTableColumns } from "./product-table-columns";
import { CreateProductForm } from "./CreateProductForm";
import type { Product } from "@/core/domain/entities/Product";

const CREATE_PRODUCT_FORM_ID = "create-product-form";
const PAGE_SIZE = 10;

export function ProductList() {
  const router = useRouter();
  const pagination = useInferredServerPagination({ pageSize: PAGE_SIZE });
  const {
    data: products = [],
    isLoading,
    error,
    refetch,
  } = useProducts({ page: pagination.page, limit: PAGE_SIZE });
  const deleteProduct = useDeleteProduct();
  const toast = useToast();
  const confirm = useConfirm();

  useEffect(() => {
    pagination.observePageResult(products.length);
  }, [products.length, pagination]);

  const actions = useMemo(
    () =>
      getProductRowActions({
        onView: (p) => router.push(`/products/${p.id}`),
        onEdit: (p) => router.push(`/products/${p.id}/edit`),
        onDelete: async (p) => {
          const ok = await confirm({
            title: "Delete product",
            description: `Delete "${p.name}"? This cannot be undone.`,
            confirmLabel: "Delete",
            variant: "destructive",
          });
          if (ok) {
            deleteProduct.mutate(p.id, {
              onSuccess: () => toast.success("Product deleted."),
              onError: () => toast.error("Failed to delete product."),
            });
          }
        },
      }),
    [router, deleteProduct, toast, confirm],
  );

  const columns = useMemo(() => getProductTableColumns(), []);

  return (
    <EntityListWithCreateModal<Product>
      data={products}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      loadingText="Loading products..."
      emptyText="No products yet."
      error={
        error
          ? {
              message: "Failed to load products. Is the backend API running?",
              onRetry: () => refetch(),
            }
          : undefined
      }
      pageSize={10}
      currentPage={pagination.page}
      totalPages={pagination.totalPages}
      totalItems={pagination.totalItems}
      onPageChange={(p) => pagination.setPage(p)}
      addLabel="Add Product"
      createTitle="Create Product"
      createSubmitText="Create Product"
      createLoadingText="Creating..."
      createFormId={CREATE_PRODUCT_FORM_ID}
      createMaxWidth="2xl"
      renderCreateForm={({ formId, onSuccess, onLoadingChange }) => (
        <CreateProductForm
          formId={formId}
          onSuccess={onSuccess}
          onLoadingChange={onLoadingChange}
        />
      )}
    />
  );
}
