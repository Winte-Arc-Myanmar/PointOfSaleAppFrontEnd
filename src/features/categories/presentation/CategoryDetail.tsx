"use client";

import Link from "next/link";
import {
  useCategory,
  useCategoryTree,
} from "@/presentation/hooks/useCategories";
import { useProducts } from "@/presentation/hooks/useProducts";
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
import type { Category } from "@/core/domain/entities/Category";

function collectCategoryIds(category: Category): Set<string> {
  const ids = new Set<string>([String(category.id)]);

  for (const child of category.children ?? []) {
    for (const childId of collectCategoryIds(child)) {
      ids.add(childId);
    }
  }

  return ids;
}

function findCategory(
  categories: Category[],
  categoryId: string,
): Category | undefined {
  for (const category of categories) {
    if (String(category.id) === categoryId) return category;
    const match = findCategory(category.children ?? [], categoryId);
    if (match) return match;
  }
  return undefined;
}

export function CategoryDetail({ categoryId }: { categoryId: string }) {
  const { data: category, isLoading, error } = useCategory(categoryId);
  const { data: categoryTree = [] } = useCategoryTree();
  const { data: productsResult, isLoading: productsLoading } = useProducts({
    page: 1,
    limit: 500,
  });
  const categoryWithDescendants =
    findCategory(categoryTree, categoryId) ?? category;
  const includedCategoryIds = categoryWithDescendants
    ? collectCategoryIds(categoryWithDescendants)
    : new Set<string>();
  const categoryProducts = (productsResult?.items ?? []).filter((product) =>
    includedCategoryIds.has(String(product.categoryId)),
  );
  const includesSubcategories =
    Array.isArray(categoryWithDescendants?.children) &&
    categoryWithDescendants.children.length > 0;
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

        <DetailSection
          title={`Products in ${category.name}${
            includesSubcategories ? " and subcategories" : ""
          } (${categoryProducts.length})`}
          icon={List}
          className="lg:col-span-2"
        >
          {productsLoading ? (
            <AppLoader
              fullScreen={false}
              size="sm"
              message="Loading products..."
            />
          ) : categoryProducts.length > 0 ? (
            <ul className="divide-y divide-border">
              {categoryProducts.map((product) => (
                <li
                  key={String(product.id)}
                  className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/products/${product.id}`}
                      className="block truncate font-medium text-foreground transition hover:text-mint"
                    >
                      {product.name}
                    </Link>
                    <p className="mt-1 text-xs text-muted">
                      SKU: {product.baseSku || "—"}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                    {product.basePrice}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">
              No products are assigned to this category.
            </p>
          )}
        </DetailSection>
      </div>
    </div>
  );
}
