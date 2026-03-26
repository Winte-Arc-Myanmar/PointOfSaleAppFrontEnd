"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import {
  useProducts,
  useDeleteProduct,
} from "@/presentation/hooks/useProducts";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { Button } from "@/presentation/components/ui/button";
import { DataTable } from "@/presentation/components/data-table";
import { FormModal } from "@/presentation/components/modal/FormModal";
import { getProductRowActions } from "./product-row-actions";
import { getProductTableColumns } from "./product-table-columns";
import { CreateProductForm } from "./CreateProductForm";
import type { Product } from "@/core/domain/entities/Product";

const CREATE_PRODUCT_FORM_ID = "create-product-form";

export function ProductList() {
  const router = useRouter();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createFormLoading, setCreateFormLoading] = useState(false);
  const { data: products = [], isLoading, error, refetch } = useProducts();
  const deleteProduct = useDeleteProduct();
  const toast = useToast();
  const confirm = useConfirm();

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
    [router, deleteProduct, toast, confirm]
  );

  const columns = useMemo(() => getProductTableColumns(), []);

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>
      <DataTable<Product>
        data={products}
        columns={columns}
        actions={actions}
        isLoading={isLoading}
        loadingText="Loading products..."
        emptyText="No products yet."
        emptyAction={{
          label: "Add Product",
          onClick: () => setCreateModalOpen(true),
        }}
        error={
          error
            ? {
                message: "Failed to load products. Is the backend API running?",
                onRetry: () => refetch(),
              }
            : undefined
        }
        pageSize={10}
      />
      <FormModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Product"
        formId={CREATE_PRODUCT_FORM_ID}
        formContent={
          <CreateProductForm
            formId={CREATE_PRODUCT_FORM_ID}
            onSuccess={() => setCreateModalOpen(false)}
            onLoadingChange={setCreateFormLoading}
          />
        }
        submitText="Create Product"
        loadingText="Creating..."
        isLoading={createFormLoading}
        maxWidth="2xl"
      />
    </>
  );
}
