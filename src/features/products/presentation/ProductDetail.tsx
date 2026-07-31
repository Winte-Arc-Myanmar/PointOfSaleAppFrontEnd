"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Box,
  FolderTree,
  Image as ImageIcon,
  Info,
  Package,
  Receipt,
  Tag,
  Warehouse,
  FlaskConical,
  Layers,
  CalendarClock,
} from "lucide-react";
import { useProduct } from "@/presentation/hooks/useProducts";
import { useModifierGroups } from "@/presentation/hooks/useModifierGroups";
import { useRecipes } from "@/presentation/hooks/useRecipes";
import { useBundles } from "@/presentation/hooks/useBundles";
import { usePricingSchedules } from "@/presentation/hooks/usePricingSchedules";
import { useProductVariants } from "@/presentation/hooks/useProductVariants";
import { resolveMediaUrl } from "@/lib/media-url";
import { Button } from "@/presentation/components/ui/button";
import { ProductVariantSection } from "./ProductVariantSection";
import { InventoryBalancePanel } from "@/features/inventory-ledger/presentation/InventoryBalancePanel";
import {
  DetailSection,
  DetailRows,
  DetailPageHeader,
  safeText,
  formatDate,
} from "@/presentation/components/detail";
import { AppLoader } from "@/presentation/components/loader";
import { cn } from "@/lib/utils";
import { getPaginatedItems } from "@/presentation/hooks/pagination";

const DETAIL_TABS = [
  { key: "overview", label: "Overview", icon: Package },
  { key: "category", label: "Category", icon: FolderTree },
  { key: "tax", label: "Price & Tax", icon: Receipt },
  { key: "stock", label: "Stock", icon: Warehouse },
  { key: "recordInfo", label: "Record Info", icon: Info },
] as const;

type DetailTabKey = (typeof DETAIL_TABS)[number]["key"];

export function ProductDetail({ productId }: { productId: string }) {
  const { data: product, isLoading, error } = useProduct(productId);
  const { data: modifierGroupsResult } = useModifierGroups({ page: 1, limit: 200 });
  const { data: recipesResult } = useRecipes({ page: 1, limit: 500 });
  const { data: bundlesResult } = useBundles({ page: 1, limit: 500 });
  const { data: pricingSchedulesResult } = usePricingSchedules({ page: 1, limit: 500 });
  const { data: productVariantsResult } = useProductVariants(productId, { page: 1, limit: 200 });
  const modifierGroups = getPaginatedItems(modifierGroupsResult);
  const recipes = getPaginatedItems(recipesResult);
  const bundles = getPaginatedItems(bundlesResult);
  const pricingSchedules = getPaginatedItems(pricingSchedulesResult);
  const productVariants = getPaginatedItems(productVariantsResult);
  const [activeTab, setActiveTab] = useState<DetailTabKey>("overview");

  const relatedModifierGroups = useMemo(
    () =>
      product
        ? modifierGroups.filter((group) => group.tenantId === product.tenantId)
        : [],
    [modifierGroups, product],
  );
  const relatedRecipeCount = useMemo(() => {
    const variantIds = new Set(productVariants.map((variant) => variant.id));
    return recipes.filter((recipe) => variantIds.has(recipe.variantId)).length;
  }, [productVariants, recipes]);
  const relatedBundleCount = useMemo(
    () => bundles.filter((bundle) => bundle.productId === productId).length,
    [bundles, productId],
  );
  const relatedPricingScheduleCount = useMemo(() => {
    if (!product) return 0;
    const variantIds = new Set(productVariants.map((variant) => variant.id));
    return pricingSchedules.filter((schedule) =>
      schedule.rules?.some(
        (rule) =>
          (rule.variantId && variantIds.has(rule.variantId)) ||
          (rule.categoryId && rule.categoryId === product.categoryId),
      ),
    ).length;
  }, [pricingSchedules, product, productVariants]);

  const overviewRows = product
    ? [
        { label: "Product ID", value: safeText(product.id), mono: true },
        { label: "Base SKU", value: safeText(product.baseSku), mono: true },
        { label: "Base price", value: safeText(product.basePrice) },
        { label: "Tracking type", value: safeText(product.trackingType) },
        { label: "Tenant ID", value: safeText(product.tenantId), mono: true },
      ]
    : [];

  const categoryRows = product
    ? [
        { label: "Category", value: safeText(product.categoryName ?? product.categoryId) },
        { label: "Category ID", value: safeText(product.categoryId), mono: true },
        ...(product.categoryDescription
          ? [{ label: "Category description", value: safeText(product.categoryDescription) }]
          : []),
        ...(product.categoryParentId != null
          ? [{ label: "Category parent ID", value: safeText(product.categoryParentId), mono: true }]
          : []),
        ...(product.categorySortOrder != null
          ? [{ label: "Category sort order", value: safeText(product.categorySortOrder) }]
          : []),
      ]
    : [];

  const uomRows = product
    ? [
        { label: "Base UOM", value: safeText(product.baseUomName ?? product.baseUomId) },
        { label: "Base UOM ID", value: safeText(product.baseUomId), mono: true },
        ...(product.baseUomClassId != null
          ? [{ label: "Base UOM class ID", value: safeText(product.baseUomClassId), mono: true }]
          : []),
        ...(product.baseUomConversionRateToBase != null
          ? [{ label: "Conversion rate to base", value: safeText(product.baseUomConversionRateToBase) }]
          : []),
      ]
    : [];

  const recordRows = product
    ? [
        { label: "Created at", value: formatDate(product.createdAt) },
        { label: "Updated at", value: formatDate(product.updatedAt) },
        ...(product.deletedAt ? [{ label: "Deleted at", value: formatDate(product.deletedAt) }] : []),
      ]
    : [];

  const taxRows = product
    ? [
        {
          label: "Product price",
          value: safeText(product.basePrice),
        },
        {
          label: "Taxable",
          value: product.isTaxable == null ? "—" : product.isTaxable ? "Yes" : "No",
        },
        {
          label: "Tax rate name",
          value: product.taxRateName ? safeText(product.taxRateName) : "—",
        },
        {
          label: "Tax rate ID",
          value: product.taxRateId ? safeText(product.taxRateId) : "—",
          mono: true,
        },
      ]
    : [];

  const activeRows = useMemo(() => {
    switch (activeTab) {
      case "overview":
        return overviewRows;
      case "category":
        return categoryRows;
      case "tax":
        return taxRows;
      case "stock":
        return [];
      case "recordInfo":
        return recordRows;
      default:
        return overviewRows;
    }
  }, [activeTab, categoryRows, overviewRows, recordRows, taxRows, uomRows]);

  const activeTabConfig =
    DETAIL_TABS.find((tab) => tab.key === activeTab) ?? DETAIL_TABS[0];

  if (isLoading) {
    return <AppLoader fullScreen={false} size="md" message="Loading product..." />;
  }

  if (error || !product) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Product not found or failed to load.</p>
        <Link href="/products">
          <Button variant="outline">Back to Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DetailPageHeader
        backHref="/products"
        backLabel="Products"
        title={safeText(product.name)}
        editHref={`/products/${product.id}/edit`}
      />

      <section className="overflow-hidden rounded-2xl border border-border bg-background/80 shadow-sm">
        <div className="px-4 py-4 sm:px-6">
          <div className="inline-flex w-full flex-wrap gap-2 rounded-2xl border border-border bg-background/60 p-2">
            {DETAIL_TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              const Icon = tab.icon;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-mint/15 text-foreground shadow-sm ring-1 ring-mint/30"
                      : "text-muted hover:bg-mint/8 hover:text-foreground",
                  )}
                >
                  <Icon className={cn("size-4", isActive ? "text-mint" : "text-muted")} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="border-t border-border px-5 py-5 sm:px-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-mint/10 text-mint">
              <activeTabConfig.icon className="size-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                {activeTabConfig.label}
              </h3>
              <p className="text-sm text-muted">
                Focused information for this section only.
              </p>
            </div>
          </div>

          {activeTab !== "stock" && (
            <div className="rounded-xl border border-border/70 bg-background/60 p-1">
              <DetailRows rows={activeRows} />
            </div>
          )}

          {activeTab === "category" && (
            <div className="mt-4">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1 text-xs font-medium text-muted">
                <Box className="size-3.5 text-mint" />
                Base UOM
              </div>
              <div className="rounded-xl border border-border/70 bg-background/60 p-1">
                <DetailRows rows={uomRows} />
              </div>
            </div>
          )}

        </div>
      </section>

      {activeTab === "overview" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <DetailSection title="Product image" icon={ImageIcon}>
              {product.imageUrl ? (
                <div className="relative mx-auto aspect-square w-full max-w-xs rounded-xl border border-border bg-muted/20 sm:max-w-sm">
                  <Image
                    src={
                      product.imageUrl.startsWith("data:") || /^https?:\/\//i.test(product.imageUrl)
                        ? product.imageUrl
                        : resolveMediaUrl(product.imageUrl)
                    }
                    alt={`${product.name} product image`}
                    fill
                    className="object-contain p-4"
                    sizes="(max-width: 640px) 100vw, 384px"
                    unoptimized
                  />
                </div>
              ) : (
                <p className="text-sm text-muted">No image for this product.</p>
              )}
            </DetailSection>

            {product.globalAttributes != null &&
              Object.keys(product.globalAttributes).length > 0 && (
                <DetailSection title="Global attributes" icon={Tag}>
                  <pre className="overflow-auto rounded-xl bg-muted/40 p-4 text-xs font-mono text-foreground">
                    {JSON.stringify(product.globalAttributes, null, 2)}
                  </pre>
                </DetailSection>
              )}
          </div>
          <DetailSection title="Modifier groups" icon={Tag}>
            <div className="rounded-md border border-border p-3">
              <p className="text-sm text-muted">
                Tenant-level groups that can be attached to this product.
              </p>
              <p className="mt-2 text-2xl font-semibold">{relatedModifierGroups.length}</p>
              <Link href="/modifier-groups" className="text-sm text-mint hover:underline">
                View modifier groups
              </Link>
            </div>
          </DetailSection>
          <DetailSection title="Recipes" icon={FlaskConical}>
            <div className="rounded-md border border-border p-3">
              <p className="text-sm text-muted">
                Recipes linked to this product&apos;s variants.
              </p>
              <p className="mt-2 text-2xl font-semibold">{relatedRecipeCount}</p>
              <Link href="/recipes" className="text-sm text-mint hover:underline">
                Manage recipes
              </Link>
            </div>
          </DetailSection>
          <DetailSection title="Bundles" icon={Layers}>
            <div className="rounded-md border border-border p-3">
              <p className="text-sm text-muted">
                Combo bundles where this product is the bundle item.
              </p>
              <p className="mt-2 text-2xl font-semibold">{relatedBundleCount}</p>
              <Link href="/bundles" className="text-sm text-mint hover:underline">
                Manage bundles
              </Link>
            </div>
          </DetailSection>
          <DetailSection title="Pricing schedules" icon={CalendarClock}>
            <div className="rounded-md border border-border p-3">
              <p className="text-sm text-muted">
                Schedules with rules targeting this product&apos;s variants or category.
              </p>
              <p className="mt-2 text-2xl font-semibold">{relatedPricingScheduleCount}</p>
              <Link href="/pricing-schedules" className="text-sm text-mint hover:underline">
                Manage pricing schedules
              </Link>
            </div>
          </DetailSection>
        </div>
      )}

      {activeTab === "stock" && (
        <div className="space-y-5">
          <InventoryBalancePanel />
          <ProductVariantSection productId={productId} />
        </div>
      )}
    </div>
  );
}
