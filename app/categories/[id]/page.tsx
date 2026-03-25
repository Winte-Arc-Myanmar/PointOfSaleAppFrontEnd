import { Shell } from "@/presentation/components/layout/Shell";
import { CategoryDetail } from "@/features/categories/presentation/CategoryDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CategoryDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <CategoryDetail categoryId={id} />
    </Shell>
  );
}
