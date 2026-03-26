"use client";

import Link from "next/link";
import { useProduct } from "@/presentation/hooks/useProducts";
import { Button } from "@/presentation/components/ui/button";
import { Package, Tag, Layers, Info } from "lucide-react";
import { ProductVariantSection } from "./ProductVariantSection";
import {
  DetailSection,
  DetailRows,
  DetailPageHeader,
  safeText,
  formatDate,
} from "@/presentation/components/detail";
import { AppLoader } from "@/presentation/components/loader";

export function ProductDetail({ productId }: { productId: string }) {
  const { data: product, isLoading, error } = useProduct(productId);
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

  if (isLoading) return <AppLoader fullScreen={false} size="md" message="Loading product..." />;
  if (error || !product)
    return (
      <div className="space-y-4">
        <p className="text-red-500">Product not found or failed to load.</p>
        <Link href="/products">
          <Button variant="outline">Back to Products</Button>
        </Link>
      </div>
    );

  return (
    <div className="space-y-6">
      <DetailPageHeader
        backHref="/products"
        backLabel="Products"
        title={safeText(product.name)}
        editHref={`/products/${product.id}/edit`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DetailSection title="Overview" icon={Package}>
          <DetailRows rows={overviewRows} />
        </DetailSection>

        <DetailSection title="Category" icon={Layers}>
          <DetailRows rows={categoryRows} />
        </DetailSection>

        <DetailSection title="Base UOM" icon={Tag}>
          <DetailRows rows={uomRows} />
        </DetailSection>

        <DetailSection title="Record info" icon={Info}>
          <DetailRows rows={recordRows} />
        </DetailSection>

        {product.globalAttributes != null && Object.keys(product.globalAttributes).length > 0 && (
          <DetailSection title="Global attributes" icon={Tag} className="lg:col-span-2">
            <pre className="text-xs font-mono text-foreground overflow-auto rounded bg-muted/50 p-3">
              {JSON.stringify(product.globalAttributes, null, 2)}
            </pre>
          </DetailSection>
        )}
      </div>

      <ProductVariantSection productId={productId} />
    </div>
  );
}
