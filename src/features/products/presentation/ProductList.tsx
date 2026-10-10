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
import type { PosType } from "@/core/domain/entities/PosReport";
import { AREA_LABEL } from "./product-kind-text";
import { useLanguage } from "@/presentation/providers/LanguageProvider";
import type { TranslationKey } from "@/presentation/i18n/translations";
import type { DataTableColumn } from "@/presentation/components/data-table";
import { useProductLabels } from "./quick/useProductLabels";

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

export const isSpaPackage = (p: Product) => p.kind === "SERVICE" && p.categoryName === "Spa Packages";

/** Food & drink and other things sold each: not hostess services, room charges or SPA packages. */
export const isMenuProduct = (p: Product) =>
  p.kind === "ITEM" || (p.kind === "SERVICE" && !p.askWhoServed && !isSpaPackage(p));

export const isHostessService = (p: Product) => p.kind === "SERVICE" && p.askWhoServed;
export const isCharge = (p: Product) => p.kind === "RENTAL";

/** One tab of Items & services: which products it shows and where its Add goes. */
export type ProductScope = "menu" | "hostess" | "charges";

const SCOPES: Record<
  ProductScope,
  { show: (p: Product) => boolean; addHref: string; addLabel: TranslationKey; empty: TranslationKey; note?: TranslationKey }
> = {
  menu: { show: isMenuProduct, addHref: "/products/new", addLabel: "addProduct.newMenu", empty: "addProduct.noMatch" },
  hostess: {
    show: isHostessService,
    addHref: "/products/new/hostess",
    addLabel: "addProduct.newHostess",
    empty: "addProduct.emptyHostess",
    note: "addProduct.hostessNote",
  },
  charges: {
    show: isCharge,
    addHref: "/products/new/rate",
    addLabel: "addProduct.newRate",
    empty: "addProduct.emptyCharges",
    note: "addProduct.chargesNote",
  },
};

export function ProductList({ scope }: { scope: ProductScope }) {
  const config = SCOPES[scope];
  const isMenu = scope === "menu";
  const { t } = useLanguage();
  const { priceWithUnit, placeKind, placesOf, chargeTags } = useProductLabels();
  const [chargedBy, setChargedBy] = useState<"all" | "TIME" | "EACH">("all");
  const [place, setPlace] = useState<"all" | "KTV_ROOM" | "SPA_ROOM" | "TABLE">("all");
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("__all__");
  const [availability, setAvailability] = useState<"all" | "available" | "unavailable">("all");
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
        config.show(p) &&
        (chargedBy === "all" || p.soldBy === chargedBy) &&
        (place === "all" || p.rents === place) &&
        (availability === "all" || p.isAvailable === (availability === "available")) &&
        (area === "all" || !p.soldAt.length || p.soldAt.includes(area)),
    );

    if (selectedCategoryId === "__all__") return byAvailability;

    const allowedCategoryIds =
      categoryFamilyMap.get(selectedCategoryId) ?? new Set([selectedCategoryId]);

    return byAvailability.filter((p) =>
      allowedCategoryIds.has(String(p.categoryId)),
    );
  }, [area, availability, categoryFamilyMap, chargedBy, config, place, productsResult?.items, search, selectedCategoryId]);

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
  }, [selectedCategoryId, availability, area, chargedBy, place, resetPage]);

  const columns = useMemo<DataTableColumn<Product>[]>(() => {
    if (isMenu) return getProductTableColumns({ onView: (p) => router.push(`/products/${p.id}`) });
    return [
      {
        key: "name",
        header: t("addProduct.colName"),
        render: (p) => (
          <button
            type="button"
            className="text-left font-medium hover:text-mint"
            onClick={() => router.push(`/products/${p.id}/edit`)}
          >
            {p.name}
          </button>
        ),
      },
      ...(scope === "charges"
        ? [
            {
              key: "rents",
              header: t("addProduct.colFor"),
              render: (p: Product) => (
                <span className="text-sm">
                  {placeKind(p)} <span className="text-muted">· {[placesOf(p), ...chargeTags(p)].join(" · ")}</span>
                </span>
              ),
            },
          ]
        : []),
      {
        key: "basePrice",
        header: t("addProduct.colPrice"),
        render: (p) => <span className="text-sm font-medium">{priceWithUnit(p)}</span>,
      },
      ...(scope === "charges"
        ? [
            {
              key: "minimumBlocks",
              header: t("addProduct.colMinimum"),
              render: (p: Product) => <span className="text-sm">{p.minimumBlocks ?? 1}</span>,
            },
          ]
        : []),
      {
        key: "isAvailable",
        header: t("addProduct.available"),
        render: (p) => (
          <AvailabilityToggle productId={String(p.id)} productName={p.name} isAvailable={p.isAvailable} />
        ),
      },
    ];
  }, [chargeTags, isMenu, placeKind, placesOf, priceWithUnit, router, scope, t]);

  return (
    <EntityListWithCreateModal<Product>
      data={pagedFilteredProducts}
      columns={columns}
      actions={[]}
      isLoading={isLoading}
      loadingText="Loading products..."
      emptyText={
        search.trim() ||
        selectedCategoryId !== "__all__" ||
        availability !== "all" ||
        area !== "all" ||
        chargedBy !== "all" ||
        place !== "all"
          ? t("addProduct.noMatch")
          : isMenu
            ? "No products yet."
            : t(config.empty)
      }
      topContent={
        <div className="mb-4 space-y-3">
        {config.note ? <p className="max-w-3xl text-xs text-muted">{t(config.note)}</p> : null}
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t("addProduct.search")}
            className="sm:w-[300px]"
          />
          {scope === "hostess" ? (
            <Select value={chargedBy} onValueChange={(value) => setChargedBy(value as typeof chargedBy)}>
              <SelectTrigger className="sm:w-[180px]">
                <SelectValue placeholder={t("addProduct.chargedHow")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("addProduct.allOfThem")}</SelectItem>
                <SelectItem value="TIME">{t("addProduct.perHour")}</SelectItem>
                <SelectItem value="EACH">{t("addProduct.perCall")}</SelectItem>
              </SelectContent>
            </Select>
          ) : null}
          {scope === "charges" ? (
            <Select value={place} onValueChange={(value) => setPlace(value as typeof place)}>
              <SelectTrigger className="sm:w-[220px]">
                <SelectValue placeholder={t("addProduct.rentsWhat")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("addProduct.allOfThem")}</SelectItem>
                <SelectItem value="KTV_ROOM">{t("addProduct.ktvRoom")}</SelectItem>
                <SelectItem value="SPA_ROOM">{t("addProduct.spaRoom")}</SelectItem>
                <SelectItem value="TABLE">{t("addProduct.tableOrRoom")}</SelectItem>
              </SelectContent>
            </Select>
          ) : null}
          {isMenu ? (
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
          ) : null}
          <Select
            value={availability}
            onValueChange={(value) => setAvailability(value as typeof availability)}
          >
            <SelectTrigger className="sm:w-[180px]">
              <SelectValue placeholder="Availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("addProduct.allAvailability")}</SelectItem>
              <SelectItem value="available">{t("addProduct.available")}</SelectItem>
              <SelectItem value="unavailable">{t("addProduct.unavailable")}</SelectItem>
            </SelectContent>
          </Select>
          {isMenu ? (
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
          ) : null}
        </div>
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
          {isMenu ? <ExcelTransferButtons kind="products" /> : null}
          <Link href={config.addHref}>
            <Button>
              <Plus className="mr-1 h-4 w-4" />
              {t(config.addLabel)}
            </Button>
          </Link>
        </div>
      }
      createEnabled={false}
      enableGridView
      showViewModeToggle
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
                {isMenu
                  ? (product.categoryName ?? "Uncategorized")
                  : scope === "charges"
                    ? placeKind(product)
                    : t("addProduct.hostessTab")}
              </p>
              {scope === "charges" ? (
                <p className="mt-1 text-[11px] font-medium text-mint">
                  {[placesOf(product), ...chargeTags(product)].join(" · ")}
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
                {isMenu
                  ? formatPrice(product.basePrice, currencyByTenantId.get(String(product.tenantId)) ?? "MMK")
                  : priceWithUnit(product)}
              </p>
              {!Number(product.basePrice) ? (
                <p className="mt-1 inline-flex w-fit rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-300">
                  No price set
                </p>
              ) : null}
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
