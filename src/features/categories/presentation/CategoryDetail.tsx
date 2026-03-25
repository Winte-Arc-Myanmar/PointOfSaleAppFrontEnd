"use client";

import Link from "next/link";
import { useCategory } from "@/presentation/hooks/useCategories";
import { Button } from "@/presentation/components/ui/button";
import { FolderTree, Info, List } from "lucide-react";
import {
  DetailSection,
  DetailRow,
  DetailPageHeader,
  safeText,
  formatDate,
} from "@/presentation/components/detail";
import { AppLoader } from "@/presentation/components/loader";

export function CategoryDetail({ categoryId }: { categoryId: string }) {
  const { data: category, isLoading, error } = useCategory(categoryId);

  if (isLoading) return <AppLoader fullScreen={false} size="md" message="Loading category..." />;
  if (error || !category)
    return (
      <div className="space-y-4">
        <p className="text-red-500">Category not found or failed to load.</p>
        <Link href="/categories">
          <Button variant="outline">Back to Categories</Button>
        </Link>
      </div>
    );

  return (
    <div className="space-y-6">
      <DetailPageHeader
        backHref="/categories"
        backLabel="Categories"
        title={safeText(category.name)}
        editHref={`/categories/${category.id}/edit`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DetailSection title="Overview" icon={FolderTree}>
          <div className="space-y-0">
            <DetailRow label="Category ID" value={safeText(category.id)} mono />
            <DetailRow label="Name" value={safeText(category.name)} />
            <DetailRow label="Tenant ID" value={safeText(category.tenantId)} mono />
            <DetailRow label="Parent ID" value={safeText(category.parentId)} mono />
            <DetailRow label="Sort order" value={safeText(category.sortOrder)} />
            {(category.description ?? "") !== "" && (
              <DetailRow label="Description" value={safeText(category.description)} />
            )}
          </div>
        </DetailSection>

        <DetailSection title="Record info" icon={Info}>
          <div className="space-y-0">
            <DetailRow label="Created at" value={formatDate(category.createdAt)} />
            <DetailRow label="Updated at" value={formatDate(category.updatedAt)} />
            {(category.deletedAt ?? "") !== "" && (
              <DetailRow label="Deleted at" value={formatDate(category.deletedAt)} />
            )}
          </div>
        </DetailSection>

        {Array.isArray(category.children) && category.children.length > 0 && (
          <DetailSection title="Child categories" icon={List} className="lg:col-span-2">
            <ul className="space-y-2">
              {category.children.map((child) => (
                <li key={child.id}>
                  <Link
                    href={`/categories/${child.id}`}
                    className="text-mint hover:underline font-medium text-sm"
                  >
                    {child.name}
                  </Link>
                </li>
              ))}
            </ul>
          </DetailSection>
        )}
      </div>
    </div>
  );
}
