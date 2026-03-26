"use client";

import Link from "next/link";
import { useCategory } from "@/presentation/hooks/useCategories";
import { Button } from "@/presentation/components/ui/button";
import { FolderTree, Info, List } from "lucide-react";
import {
  DetailSection,
  DetailRows,
  DetailPageHeader,
  safeText,
  formatDate,
} from "@/presentation/components/detail";
import { AppLoader } from "@/presentation/components/loader";

export function CategoryDetail({ categoryId }: { categoryId: string }) {
  const { data: category, isLoading, error } = useCategory(categoryId);
  const overviewRows = category
    ? [
        { label: "Category ID", value: safeText(category.id), mono: true },
        { label: "Name", value: safeText(category.name) },
        { label: "Tenant ID", value: safeText(category.tenantId), mono: true },
        { label: "Parent ID", value: safeText(category.parentId), mono: true },
        { label: "Sort order", value: safeText(category.sortOrder) },
        ...(category.description ? [{ label: "Description", value: safeText(category.description) }] : []),
      ]
    : [];
  const recordRows = category
    ? [
        { label: "Created at", value: formatDate(category.createdAt) },
        { label: "Updated at", value: formatDate(category.updatedAt) },
        ...(category.deletedAt ? [{ label: "Deleted at", value: formatDate(category.deletedAt) }] : []),
      ]
    : [];

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
          <DetailRows rows={overviewRows} />
        </DetailSection>

        <DetailSection title="Record info" icon={Info}>
          <DetailRows rows={recordRows} />
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
