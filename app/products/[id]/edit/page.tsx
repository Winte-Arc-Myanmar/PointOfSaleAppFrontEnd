/**
 * Product edit page: the simple form the product fits, else the advanced one.
 */

import { Shell } from "@/presentation/components/layout/Shell";
import { EditProductRouter } from "@/features/products/presentation/quick/EditProductRouter";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductEditPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <EditProductRouter productId={id} />
    </Shell>
  );
}
