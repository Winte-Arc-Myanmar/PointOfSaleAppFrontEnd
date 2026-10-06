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
import { ExcelTransferButtons } from "@/presentation/components/excel/ExcelTransferButtons";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import { getProductTableColumns } from "./product-table-columns";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import type { Product } from "@/core/domain/entities/Product";
import type { Category } from "@/core/domain/entities/Category";
import { useCurrency } from "@/presentation/providers/CurrencyProvider";
import { useTenants } from "@/presentation/hooks/useTenants";
import { ProductCardImage } from "@/presentation/components/product/ProductCardImage";
import { AvailabilityToggle } from "./AvailabilityToggle";
import { cn } from "@/lib/utils";
import type { ProductKind } from "@/core/domain/entities/Product";
import type { PosType } from "@/core/domain/entities/PosReport";
import { AREA_LABEL, KIND_LABEL, soldByLabel } from "./product-kind-text";

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

/** Food & drink and other things sold each: not hostess services, room charges or SPA packages. */
export const isMenuProduct = (p: Product) =>
  p.kind === "ITEM" || (p.kind === "SERVICE" && !p.askWhoServed && p.categoryName !== "Spa Packages");

export function ProductList({ menuOnly = false }: { menuOnly?: boolean }) {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("__all__");
  const [availability, setAvailability] = useState<"all" | "available" | "unavailable">("all");
  const [kind, setKind] = useState<ProductKind | "all">("all");
  const [area, setArea] = useState<PosType | "all">("all");
  const pagination = usePagination({ pageSize: PAGE_SIZE });
  const { page, setPage, reset: resetPage, getTotalPages } = pagination;
  const {
    data: productsResult,
    isLoading,
    error,
    refetch,
  } = useProducts({ page: 1, limit: 500 });
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

    const byAvailability = searchedProducts.filter(
      (p) =>
        (!menuOnly || isMenuProduct(p)) &&
        (availability === "all" || p.isAvailable === (availability === "available")) &&
        (kind === "all" || p.kind === kind) &&
        (area === "all" || !p.soldAt.length || p.soldAt.includes(area)),
    );

    if (selectedCategoryId === "__all__") return byAvailability;

    const allowedCategoryIds =
      categoryFamilyMap.get(selectedCategoryId) ?? new Set([selectedCategoryId]);

    return byAvailability.filter((p) =>
      allowedCategoryIds.has(String(p.categoryId)),
    );
  }, [area, availability, categoryFamilyMap, kind, menuOnly, productsResult?.items, search, selectedCategoryId]);

  const categoryOptions = useMemo(() => {
    return flattenCategoryTree(categoryTree).map((category) => ({
      ...category,
      label: `${"  ".repeat(category.depth)}${category.name}`,
    }));
  }, [categoryTree]);

  const pagedFilteredProducts = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, page]);

  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [searchInput]);

  useEffect(() => {
    resetPage(1);
  }, [search, resetPage]);

  useEffect(() => {
    resetPage(1);
  }, [selectedCategoryId, availability, kind, area, resetPage]);

  const columns = useMemo(
    () =>
      getProductTableColumns({
        onView: (p) => router.push(`/products/${p.id}`),
      }),
    [router],
  );

  return (
    <EntityListWithCreateModal<Product>
      data={pagedFilteredProducts}
      columns={columns}
      actions={[]}
      isLoading={isLoading}
      loadingText="Loading products..."
      emptyText={
        search.trim()
          ? "No products match your search."
          : selectedCategoryId !== "__all__" || availability !== "all" || kind !== "all" || area !== "all"
            ? "No products match these filters."
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
          <Select
            value={availability}
            onValueChange={(value) => setAvailability(value as typeof availability)}
          >
            <SelectTrigger className="sm:w-[180px]">
              <SelectValue placeholder="Availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All items</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="unavailable">Unavailable</SelectItem>
            </SelectContent>
          </Select>
          {menuOnly ? null : (
          <Select value={kind} onValueChange={(value) => setKind(value as typeof kind)}>
            <SelectTrigger className="sm:w-[160px]">
              <SelectValue placeholder="Kind" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All kinds</SelectItem>
              {(Object.keys(KIND_LABEL) as ProductKind[]).map((k) => (
                <SelectItem key={k} value={k}>
                  {KIND_LABEL[k]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          )}
          <Select value={area} onValueChange={(value) => setArea(value as typeof area)}>
            <SelectTrigger className="sm:w-[190px]">
              <SelectValue placeholder="Sold at" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Sold anywhere</SelectItem>
              {(Object.keys(AREA_LABEL) as PosType[]).map((a) => (
                <SelectItem key={a} value={a}>
                  {AREA_LABEL[a]}
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
      totalPages={getTotalPages(filteredProducts.length)}
      totalItems={filteredProducts.length}
      onPageChange={setPage}
      toolbarEndContent={
        <div className="flex items-center gap-2">
          <ExcelTransferButtons kind="products" />
          <Link href="/products/new">
            <Button>
              <Plus className="mr-1 h-4 w-4" />
              Add Product
            </Button>
          </Link>
        </div>
      }
      createEnabled={false}
      enableGridView
      showViewModeToggle={false}
      defaultViewMode="grid"
      gridClassName="grid-cols-1 justify-items-start gap-3 sm:grid-cols-2 xl:grid-cols-4"
      gridCardClassName="w-full max-w-[210px] rounded-xl border border-border bg-background/90 p-0 shadow-sm"
      gridContentClassName="pr-0"
      renderGridItem={(product) => {
        return (
          <article className={cn("flex h-full flex-col", !product.isAvailable && "opacity-60")}>
            <button
              type="button"
              aria-label={`View ${product.name} details`}
              className="relative aspect-square w-full cursor-pointer overflow-hidden rounded-t-xl bg-white focus-visible:z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-mint"
              onClick={() => router.push(`/products/${product.id}`)}
            >
              <ProductCardImage
                src={product.imageUrl}
                alt={product.name}
                sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                logoClassName="w-20"
              />
            </button>

            <div className="flex flex-1 flex-col p-2.5">
              <p className="text-[10px] uppercase tracking-[0.16em] text-muted">
                {product.categoryName ?? "Uncategorized"}
              </p>
              {product.kind !== "ITEM" ? (
                <p className="mt-1 text-[11px] font-medium text-mint">
                  {KIND_LABEL[product.kind]}
                  {product.soldBy === "TIME" ? ` · ${soldByLabel(product)}` : ""}
                </p>
              ) : null}
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
              <div className="mt-auto pt-2">
                <AvailabilityToggle
                  productId={String(product.id)}
                  productName={product.name}
                  isAvailable={product.isAvailable}
                />
              </div>
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
    />
  );
}
