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
} from "lucide-react";
import { useProduct } from "@/presentation/hooks/useProducts";
import { resolveMediaUrl } from "@/lib/media-url";
import { Button } from "@/presentation/components/ui/button";
import { ProductVariantSection } from "./ProductVariantSection";
import {
  DetailSection,
  DetailRows,
  DetailPageHeader,
  safeText,
  formatDate,
} from "@/presentation/components/detail";
import { AppLoader } from "@/presentation/components/loader";
import { cn } from "@/lib/utils";

const DETAIL_TABS = [
  { key: "overview", label: "Overview", icon: Package },
  { key: "category", label: "Category", icon: FolderTree },
  { key: "baseUom", label: "Base UOM", icon: Box },
  { key: "tax", label: "Tax", icon: Receipt },
  { key: "recordInfo", label: "Record Info", icon: Info },
] as const;

type DetailTabKey = (typeof DETAIL_TABS)[number]["key"];

export function ProductDetail({ productId }: { productId: string }) {
  const { data: product, isLoading, error } = useProduct(productId);
  const [activeTab, setActiveTab] = useState<DetailTabKey>("overview");

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
      case "baseUom":
        return uomRows;
      case "tax":
        return taxRows;
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
        <div className="border-b border-border bg-gradient-to-r from-background via-background to-mint/5 px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-muted">
                <Package className="size-3.5 text-mint" />
                Product details
              </div>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  {safeText(product.name)}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                  Review key product information through a cleaner, focused layout with
                  fast section switching and a more polished presentation.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:min-w-[260px]">
              <div className="rounded-xl border border-border bg-background/90 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
                  Base SKU
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {safeText(product.baseSku)}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-background/90 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
                  Base price
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {safeText(product.basePrice)}
                </p>
              </div>
            </div>
          </div>
        </div>

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

          <div className="rounded-xl border border-border/70 bg-background/60 p-1">
            <DetailRows rows={activeRows} />
          </div>
        </div>
      </section>

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

      <ProductVariantSection productId={productId} />
    </div>
  );
}
