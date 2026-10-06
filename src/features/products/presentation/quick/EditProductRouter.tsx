"use client";

import Link from "next/link";
import { Button } from "@/presentation/components/ui/button";
import { AppLoader } from "@/presentation/components/loader";
import { useProduct } from "@/presentation/hooks/useProducts";
import { EditProductForm } from "../EditProductForm";
import { QuickProductForm } from "./QuickProductForm";
import { quickTypeOf } from "./quick-product";

/** Edits a product with the simple form it fits, or the advanced form when none does. */
export function EditProductRouter({ productId }: { productId: string }) {
  const { data: product, isLoading, error } = useProduct(productId);

  if (isLoading) return <AppLoader fullScreen={false} size="sm" message="..." />;
  if (error || !product) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Product not found.</p>
        <Link href="/products">
          <Button variant="outline">Back to products</Button>
        </Link>
      </div>
    );
  }
  const type = quickTypeOf(product);
  return type ? <QuickProductForm type={type} product={product} /> : <EditProductForm productId={productId} />;
}
