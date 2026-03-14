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
      </dl>
      <ProductVariantSection productId={productId} />
    </div>
  );
}
