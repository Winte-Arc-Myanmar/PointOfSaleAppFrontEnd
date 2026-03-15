/**
 * Category edit page - system_admin only.
 */

import { Shell } from "@/presentation/components/layout/Shell";
import { EditCategoryForm } from "@/features/categories/presentation/EditCategoryForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CategoryEditPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Shell>
      <EditCategoryForm categoryId={id} />
    </Shell>
  );
}
