"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Image as ImageIcon } from "lucide-react";
import {
  useProducts,
  useDeleteProduct,
} from "@/presentation/hooks/useProducts";
import { usePagination } from "@/presentation/hooks/usePagination";
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
import { getProductTableColumns } from "./product-table-columns";
import { CreateProductForm } from "./CreateProductForm";
import type { Product } from "@/core/domain/entities/Product";
import { resolveMediaUrl } from "@/lib/media-url";

const CREATE_PRODUCT_FORM_ID = "create-product-form";
const PAGE_SIZE = 16;
const SEARCH_DEBOUNCE_MS = 300;

function getProductImageSrc(imageUrl: string | null | undefined): string {
  if (!imageUrl) return "";
  if (imageUrl.startsWith("data:") || /^https?:\/\//i.test(imageUrl)) {
    return imageUrl;
  }
  return resolveMediaUrl(imageUrl);
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

export function ProductList() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("__all__");
  const pagination = usePagination({ pageSize: PAGE_SIZE });
  const { page, setPage, reset: resetPage, getTotalPages } = pagination;
  const {
    data: productsResult,
    isLoading,
    error,
    refetch,
  } = useProducts({ page, limit: PAGE_SIZE });
  const { data: categoriesResult } = useCategories();
  const deleteProduct = useDeleteProduct();
  const toast = useToast();
  const confirm = useConfirm();

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    const products = productsResult?.items ?? [];
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
  }, [productsResult?.items, search, selectedCategoryId]);

  const categoryOptions = useMemo(() => {
    const categories = categoriesResult?.items ?? [];
    return categories
      .map((category) => ({ id: String(category.id), name: category.name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [categoriesResult?.items]);

  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [searchInput]);

  useEffect(() => {
    resetPage(1);
  }, [search, resetPage]);

  useEffect(() => {
    resetPage(1);
  }, [selectedCategoryId, resetPage]);

  const columns = useMemo(
    () =>
      getProductTableColumns({
        onView: (p) => router.push(`/products/${p.id}`),
      }),
    [router],
  );

  return (
    <EntityListWithCreateModal<Product>
      data={filteredProducts}
      columns={columns}
      actions={[]}
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
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
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
      pageSize={PAGE_SIZE}
      currentPage={page}
      totalPages={productsResult?.totalPages ?? getTotalPages(productsResult?.total)}
      totalItems={productsResult?.total ?? 0}
      onPageChange={setPage}
      addLabel="Add Product"
      createTitle="Create Product"
      createSubmitText="Create Product"
      createLoadingText="Creating..."
      createFormId={CREATE_PRODUCT_FORM_ID}
      createMaxWidth="2xl"
      enableGridView
      showViewModeToggle={false}
      defaultViewMode="grid"
      gridClassName="grid-cols-1 justify-items-start gap-3 sm:grid-cols-2 xl:grid-cols-4"
      gridCardClassName="w-full max-w-[210px] rounded-xl border border-border bg-background/90 p-0 shadow-sm"
      renderGridItem={(product) => {
        const imageSrc = getProductImageSrc(product.imageUrl);

        return (
          <article className="flex h-full flex-col">
            <div className="relative aspect-square w-full overflow-hidden rounded-t-xl bg-white">
              {imageSrc ? (
                <Image
                  src={imageSrc}
                  alt={product.name}
                  fill
                  className="object-contain"
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                  unoptimized
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted">
                  <div className="flex flex-col items-center gap-2 text-sm">
                    <ImageIcon className="h-6 w-6" />
                    <span>No image</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-1 flex-col p-2.5">
              <p className="text-[10px] uppercase tracking-[0.16em] text-muted">
                {product.categoryName ?? "Uncategorized"}
              </p>
              <button
                type="button"
                className="mt-1 line-clamp-2 text-left text-[13px] font-semibold leading-snug text-foreground transition-colors hover:text-mint"
                onClick={() => router.push(`/products/${product.id}`)}
              >
                {product.name}
              </button>
              <p className="mt-1.5 text-sm font-semibold text-foreground">
                ${formatPrice(product.basePrice)}
              </p>
            </div>
          </article>
        );
      }}
      onView={(item) => router.push(`/products/${item.id}`)}
      onEdit={(item) => router.push(`/products/${item.id}/edit`)}
      onDelete={async (item) => {
        const ok = await confirm({
          title: "Delete product",
          description: `Delete "${item.name}"? This cannot be undone.`,
          confirmLabel: "Delete",
          variant: "destructive",
        });
        if (!ok) return;
        deleteProduct.mutate(item.id, {
          onSuccess: () => toast.success("Product deleted."),
          onError: () => toast.error("Failed to delete product."),
        });
      }}
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
