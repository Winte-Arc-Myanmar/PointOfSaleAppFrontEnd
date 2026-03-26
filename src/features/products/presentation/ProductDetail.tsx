"use client";

import Link from "next/link";
import { useProduct } from "@/presentation/hooks/useProducts";
import { Button } from "@/presentation/components/ui/button";
import { Package, Tag, Layers, Info } from "lucide-react";
import { ProductVariantSection } from "./ProductVariantSection";
import {
  DetailSection,
  DetailRow,
  DetailPageHeader,
  safeText,
  formatDate,
} from "@/presentation/components/detail";
import { AppLoader } from "@/presentation/components/loader";

export function ProductDetail({ productId }: { productId: string }) {
  const { data: product, isLoading, error } = useProduct(productId);

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
          <div className="space-y-0">
            <DetailRow label="Product ID" value={safeText(product.id)} mono />
            <DetailRow label="Base SKU" value={safeText(product.baseSku)} mono />
            <DetailRow label="Base price" value={safeText(product.basePrice)} />
            <DetailRow label="Tracking type" value={safeText(product.trackingType)} />
            <DetailRow label="Tenant ID" value={safeText(product.tenantId)} mono />
          </div>
        </DetailSection>

        <DetailSection title="Category" icon={Layers}>
          <div className="space-y-0">
            <DetailRow label="Category" value={safeText(product.categoryName ?? product.categoryId)} />
            <DetailRow label="Category ID" value={safeText(product.categoryId)} mono />
            {product.categoryDescription != null && product.categoryDescription !== "" && (
              <DetailRow label="Category description" value={safeText(product.categoryDescription)} />
            )}
            {product.categoryParentId != null && (
              <DetailRow label="Category parent ID" value={safeText(product.categoryParentId)} mono />
            )}
            {product.categorySortOrder != null && (
              <DetailRow label="Category sort order" value={safeText(product.categorySortOrder)} />
            )}
          </div>
        </DetailSection>

        <DetailSection title="Base UOM" icon={Tag}>
          <div className="space-y-0">
            <DetailRow label="Base UOM" value={safeText(product.baseUomName ?? product.baseUomId)} />
            <DetailRow label="Base UOM ID" value={safeText(product.baseUomId)} mono />
            {product.baseUomClassId != null && (
              <DetailRow label="Base UOM class ID" value={safeText(product.baseUomClassId)} mono />
            )}
            {product.baseUomConversionRateToBase != null && (
              <DetailRow label="Conversion rate to base" value={safeText(product.baseUomConversionRateToBase)} />
            )}
          </div>
        </DetailSection>

        <DetailSection title="Record info" icon={Info}>
          <div className="space-y-0">
            <DetailRow label="Created at" value={formatDate(product.createdAt)} />
            <DetailRow label="Updated at" value={formatDate(product.updatedAt)} />
            {product.deletedAt != null && product.deletedAt !== "" && (
              <DetailRow label="Deleted at" value={formatDate(product.deletedAt)} />
            )}
          </div>
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
