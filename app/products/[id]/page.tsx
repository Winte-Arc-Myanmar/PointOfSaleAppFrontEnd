/**
 * Product detail page - includes variants section.
 */

import { Shell } from "@/presentation/components/layout/Shell";
import { ProductDetail } from "@/features/products/presentation/ProductDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <ProductDetail productId={id} />
    </Shell>
  );
}
