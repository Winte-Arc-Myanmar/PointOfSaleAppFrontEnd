"use client";

import Link from "next/link";
import { useCategory } from "@/presentation/hooks/useCategories";
import { Button } from "@/presentation/components/ui/button";
import { ArrowLeft } from "lucide-react";

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  try {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? value : d.toLocaleString();
  } catch {
    return value;
  }
}

export function CategoryDetail({ categoryId }: { categoryId: string }) {
  const { data: category, isLoading, error } = useCategory(categoryId);

  if (isLoading) return <p className="text-muted">Loading category...</p>;
  if (error || !category)
    return (
      <div className="space-y-4">
        <p className="text-red-500">Category not found or failed to load.</p>
        <Link href="/admin/categories">
          <Button variant="outline">Back to Categories</Button>
        </Link>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/categories">
          <Button variant="ghost" size="icon" aria-label="Back to Categories">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="panel-header text-xl tracking-tight text-foreground">
          {category.name}
        </h1>
        <Link href={`/admin/categories/${category.id}/edit`}>
          <Button>Edit</Button>
        </Link>
      </div>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-muted">Category ID</dt>
          <dd className="font-mono text-xs">{category.id}</dd>
        </div>
        <div>
          <dt className="text-muted">Name</dt>
          <dd className="font-medium">{category.name}</dd>
        </div>
        <div>
          <dt className="text-muted">Tenant ID</dt>
          <dd className="font-mono text-xs">{category.tenantId}</dd>
        </div>
        <div>
          <dt className="text-muted">Parent ID</dt>
          <dd className="font-mono text-xs">{category.parentId ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-muted">Sort order</dt>
          <dd>{category.sortOrder}</dd>
        </div>
        <div>
          <dt className="text-muted">Created at</dt>
          <dd>{formatDate(category.createdAt)}</dd>
        </div>
        <div>
          <dt className="text-muted">Updated at</dt>
          <dd>{formatDate(category.updatedAt)}</dd>
        </div>
        {(category.deletedAt ?? "") !== "" && (
          <div>
            <dt className="text-muted">Deleted at</dt>
            <dd>{formatDate(category.deletedAt)}</dd>
          </div>
        )}
        {(category.description ?? "") !== "" && (
          <div className="sm:col-span-2">
            <dt className="text-muted">Description</dt>
            <dd>{category.description}</dd>
          </div>
        )}
      </dl>
      {Array.isArray(category.children) && category.children.length > 0 && (
        <section className="border-t border-border pt-4">
          <h2 className="text-sm font-medium text-muted mb-2">Child categories</h2>
          <ul className="space-y-1">
            {category.children.map((child) => (
              <li key={child.id}>
                <Link
                  href={`/admin/categories/${child.id}`}
                  className="text-mint hover:underline font-medium"
                >
                  {child.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
