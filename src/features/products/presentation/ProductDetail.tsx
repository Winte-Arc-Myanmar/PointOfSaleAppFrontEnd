"use client";

import Link from "next/link";
import { useProduct } from "@/presentation/hooks/useProducts";
import { Button } from "@/presentation/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ProductVariantSection } from "./ProductVariantSection";

export function ProductDetail({ productId }: { productId: string }) {
  const { data: product, isLoading, error } = useProduct(productId);

  if (isLoading) return <p className="text-muted">Loading product...</p>;
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
      <div className="flex items-center gap-4">
        <Link href="/products">
          <Button variant="ghost" size="icon" aria-label="Back to products">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="panel-header text-xl tracking-tight text-foreground">{product.name}</h1>
        <Link href={`/products/${product.id}/edit`}>
          <Button>Edit</Button>
        </Link>
      </div>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-muted">Product ID</dt>
          <dd className="font-mono text-xs">{product.id}</dd>
        </div>
        <div>
          <dt className="text-muted">Base SKU</dt>
          <dd className="font-medium">{product.baseSku}</dd>
        </div>
        <div>
          <dt className="text-muted">Base price</dt>
          <dd>{product.basePrice}</dd>
        </div>
        <div>
          <dt className="text-muted">Tracking type</dt>
          <dd>{product.trackingType}</dd>
        </div>
        <div>
          <dt className="text-muted">Category</dt>
          <dd>{product.categoryName ?? product.categoryId}</dd>
        </div>
        {product.categoryDescription != null && product.categoryDescription !== "" && (
          <div className="sm:col-span-2">
            <dt className="text-muted">Category description</dt>
            <dd>{product.categoryDescription}</dd>
          </div>
        )}
        {(product.categoryParentId != null ||
          product.categorySortOrder != null ||
          product.categoryCreatedAt != null ||
          product.categoryUpdatedAt != null) && (
          <>
            {product.categoryParentId != null && (
              <div>
                <dt className="text-muted">Category parent ID</dt>
                <dd className="font-mono text-xs">{product.categoryParentId}</dd>
              </div>
            )}
            {product.categorySortOrder != null && (
              <div>
                <dt className="text-muted">Category sort order</dt>
                <dd>{product.categorySortOrder}</dd>
              </div>
            )}
            {product.categoryCreatedAt != null && (
              <div>
                <dt className="text-muted">Category created at</dt>
                <dd className="text-muted">{product.categoryCreatedAt}</dd>
              </div>
            )}
            {product.categoryUpdatedAt != null && (
              <div>
                <dt className="text-muted">Category updated at</dt>
                <dd className="text-muted">{product.categoryUpdatedAt}</dd>
              </div>
            )}
          </>
        )}
        <div>
          <dt className="text-muted">Base UOM</dt>
          <dd>{product.baseUomName ?? product.baseUomId}</dd>
        </div>
        <div>
          <dt className="text-muted">Tenant ID</dt>
          <dd className="font-mono text-xs">{product.tenantId}</dd>
        </div>
        <div>
          <dt className="text-muted">Category ID</dt>
          <dd className="font-mono text-xs">{product.categoryId}</dd>
        </div>
        <div>
          <dt className="text-muted">Base UOM ID</dt>
          <dd className="font-mono text-xs">{product.baseUomId}</dd>
        </div>
        {(product.baseUomClassId != null ||
          product.baseUomConversionRateToBase != null) && (
          <>
            {product.baseUomClassId != null && (
              <div>
                <dt className="text-muted">Base UOM class ID</dt>
                <dd className="font-mono text-xs">{product.baseUomClassId}</dd>
              </div>
            )}
            {product.baseUomConversionRateToBase != null && (
              <div>
                <dt className="text-muted">Conversion rate to base</dt>
                <dd>{product.baseUomConversionRateToBase}</dd>
              </div>
            )}
          </>
        )}
        {product.globalAttributes != null && Object.keys(product.globalAttributes).length > 0 && (
          <div className="sm:col-span-2">
            <dt className="text-muted">Global attributes</dt>
            <dd className="font-mono text-xs break-all">
              {JSON.stringify(product.globalAttributes)}
            </dd>
          </div>
        )}
        {product.deletedAt != null && product.deletedAt !== "" && (
          <div>
            <dt className="text-muted">Deleted at</dt>
            <dd className="text-muted">{product.deletedAt}</dd>
          </div>
        )}
        {product.createdAt != null && product.createdAt !== "" && (
          <div>
            <dt className="text-muted">Created at</dt>
            <dd className="text-muted">{product.createdAt}</dd>
          </div>
        )}
        {product.updatedAt != null && product.updatedAt !== "" && (
          <div>
            <dt className="text-muted">Updated at</dt>
            <dd className="text-muted">{product.updatedAt}</dd>
          </div>
        )}
      </dl>
      <ProductVariantSection productId={productId} />
    </div>
  );
}
