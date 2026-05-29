"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useProducts,
  useDeleteProduct,
} from "@/presentation/hooks/useProducts";
import { useInferredServerPagination } from "@/presentation/hooks/useInferredServerPagination";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { Input } from "@/presentation/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { useCategories } from "@/presentation/hooks/useCategories";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import { getProductRowActions } from "./product-row-actions";
import { getProductTableColumns } from "./product-table-columns";
import { CreateProductForm } from "./CreateProductForm";
import type { Product } from "@/core/domain/entities/Product";

const CREATE_PRODUCT_FORM_ID = "create-product-form";
const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

export function ProductList() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("__all__");
  const pagination = useInferredServerPagination({ pageSize: PAGE_SIZE });
  const {
    data: products = [],
    isLoading,
    error,
    refetch,
  } = useProducts({ page: pagination.page, limit: PAGE_SIZE });
  const { data: categories = [] } = useCategories();
  const deleteProduct = useDeleteProduct();
  const toast = useToast();
  const confirm = useConfirm();
  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    const searchedProducts = !q
      ? products
      : products.filter((p) =>
          [
            p.name,
            p.baseSku,
            p.categoryName ?? "",
            p.baseUomName ?? "",
            p.tenantId,
            String(p.id),
          ]
            .join(" ")
            .toLowerCase()
            .includes(q),
        );

    if (selectedCategoryId === "__all__") return searchedProducts;
    return searchedProducts.filter((p) => p.categoryId === selectedCategoryId);
  }, [products, search, selectedCategoryId]);

  const categoryOptions = useMemo(() => {
    return categories
      .map((category) => ({ id: String(category.id), name: category.name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [categories]);

  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [searchInput]);

  useEffect(() => {
    pagination.observePageResult(filteredProducts.length);
  }, [filteredProducts.length, pagination]);

  useEffect(() => {
    pagination.reset(1);
  }, [search, pagination]);

  useEffect(() => {
    pagination.reset(1);
  }, [selectedCategoryId, pagination]);

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

  const columns = useMemo(
    () =>
      getProductTableColumns({
        onView: (p) => router.push(`/products/${p.id}`),
      }),
    [router],
  );

  async function handleDeleteSelected(items: Product[]) {
    if (items.length === 0) return;
    const ok = await confirm({
      title: "Delete products",
      description: `Delete ${items.length} selected product(s)? This cannot be undone.`,
      confirmLabel: "Delete",
      variant: "destructive",
    });
    if (!ok) return;
    try {
      for (const item of items) {
        await deleteProduct.mutateAsync(item.id);
      }
      toast.success(`${items.length} product(s) deleted.`);
    } catch {
      toast.error("Failed to delete some products.");
    }
  }

  return (
    <EntityListWithCreateModal<Product>
      data={filteredProducts}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      loadingText="Loading products..."
      emptyText={
        search.trim()
          ? "No products match your search."
          : selectedCategoryId !== "__all__"
            ? "No products match this category."
            : "No products yet."
      }
      topContent={
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search products..."
            className="sm:w-[360px]"
          />
          <Select
            value={selectedCategoryId}
            onValueChange={setSelectedCategoryId}
          >
            <SelectTrigger className="sm:w-[240px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All categories</SelectItem>
              {categoryOptions.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      }
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
      enableRowSelection
      onEditSelected={(item) => router.push(`/products/${item.id}/edit`)}
      onDeleteSelected={handleDeleteSelected}
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
