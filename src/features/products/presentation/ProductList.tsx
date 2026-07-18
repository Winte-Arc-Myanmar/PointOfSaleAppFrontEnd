"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
import { useCategoryTree } from "@/presentation/hooks/useCategories";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import { getProductTableColumns } from "./product-table-columns";
import { CreateProductForm } from "./CreateProductForm";
import type { Product } from "@/core/domain/entities/Product";
import type { Category } from "@/core/domain/entities/Category";
import { useCurrency } from "@/presentation/providers/CurrencyProvider";
import { useTenants } from "@/presentation/hooks/useTenants";
import { ProductCardImage } from "@/presentation/components/product/ProductCardImage";

const CREATE_PRODUCT_FORM_ID = "create-product-form";
const PAGE_SIZE = 16;
const SEARCH_DEBOUNCE_MS = 300;

function flattenCategoryTree(
  categories: Category[],
  depth = 0,
): Array<{ id: string; name: string; depth: number }> {
  return categories.flatMap((category) => [
    {
      id: String(category.id),
      name: category.name,
      depth,
    },
    ...flattenCategoryTree(category.children ?? [], depth + 1),
  ]);
}

function buildCategoryFamilyMap(categories: Category[]) {
  const map = new Map<string, Set<string>>();

  const visit = (category: Category): Set<string> => {
    const categoryId = String(category.id);
    const descendantIds = new Set<string>([categoryId]);

    for (const child of category.children ?? []) {
      const childIds = visit(child);
      for (const childId of childIds) {
        descendantIds.add(childId);
      }
    }

    map.set(categoryId, descendantIds);
    return descendantIds;
  };

  for (const category of categories) {
    visit(category);
  }

  return map;
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
  const { data: categoryTree = [] } = useCategoryTree();
  const { data: tenantsResult } = useTenants({ page: 1, limit: 200 });
  const deleteProduct = useDeleteProduct();
  const toast = useToast();
  const confirm = useConfirm();
  const { formatPrice } = useCurrency();

  const currencyByTenantId = useMemo(
    () =>
      new Map(
        (tenantsResult?.items ?? []).map((tenant) => [
          String(tenant.id),
          tenant.baseCurrency,
        ]),
      ),
    [tenantsResult?.items],
  );

  const categoryFamilyMap = useMemo(
    () => buildCategoryFamilyMap(categoryTree),
    [categoryTree],
  );

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

    const allowedCategoryIds =
      categoryFamilyMap.get(selectedCategoryId) ?? new Set([selectedCategoryId]);

    return searchedProducts.filter((p) =>
      allowedCategoryIds.has(String(p.categoryId)),
    );
  }, [categoryFamilyMap, productsResult?.items, search, selectedCategoryId]);

  const categoryOptions = useMemo(() => {
    return flattenCategoryTree(categoryTree).map((category) => ({
      ...category,
      label: `${"  ".repeat(category.depth)}${category.name}`,
    }));
  }, [categoryTree]);

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
                  {category.label}
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
        return (
          <article className="flex h-full flex-col">
            <div className="relative aspect-square w-full overflow-hidden rounded-t-xl bg-white">
              <ProductCardImage
                src={product.imageUrl}
                alt={product.name}
                sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                logoClassName="w-20"
              />
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
                {formatPrice(
                  product.basePrice,
                  currencyByTenantId.get(String(product.tenantId)) ?? "MMK",
                )}
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
