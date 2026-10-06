import { Shell } from "@/presentation/components/layout/Shell";
import { EditProductForm } from "@/features/products/presentation/EditProductForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductAdvancedEditPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <EditProductForm productId={id} />
    </Shell>
  );
}
