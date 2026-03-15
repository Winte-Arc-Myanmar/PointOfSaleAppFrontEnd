"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, FolderTree } from "lucide-react";
import { useCategoryTree } from "@/presentation/hooks/useCategories";
import { cn } from "@/lib/utils";
import type { Category } from "@/core/domain/entities/Category";

function CategoryTreeItem({
  category,
  depth = 0,
  onNavigate,
}: {
  category: Category;
  depth?: number;
  onNavigate?: (id: string) => void;
}) {
  const router = useRouter();
  const hasChildren = Array.isArray(category.children) && category.children.length > 0;
  const handleClick = () => {
    if (onNavigate) onNavigate(category.id);
    else router.push(`/admin/categories/${category.id}`);
  };

  return (
    <div className="select-none" style={{ marginLeft: depth * 16 }}>
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
        className={cn(
          "flex items-center gap-2 py-1.5 px-2 rounded-md text-sm",
          "hover:bg-mint/10 focus:outline-none focus:ring-2 focus:ring-mint focus:ring-offset-1"
        )}
      >
        <span
          className={cn(
            "flex items-center justify-center w-5 h-5 rounded",
            hasChildren && "text-muted"
          )}
        >
          {hasChildren ? (
            <ChevronRight className="h-4 w-4" aria-hidden />
          ) : (
            <span className="w-2 h-2 rounded-full bg-mint/50" aria-hidden />
          )}
        </span>
        <span className="font-medium truncate">{category.name}</span>
        {category.sortOrder !== undefined && (
          <span className="text-muted text-xs">({category.sortOrder})</span>
        )}
      </div>
      {hasChildren && (
        <div className="border-l border-border ml-2.5 pl-0">
          {category.children!.map((child) => (
            <CategoryTreeItem
              key={child.id}
              category={child}
              depth={depth + 1}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CategoryTree() {
  const { data: roots = [], isLoading, error, refetch } = useCategoryTree();

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-background p-4">
        <p className="text-muted text-sm">Loading category tree...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-border bg-background p-4">
        <p className="text-red-600 text-sm">Failed to load category tree.</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-2 text-sm text-mint hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (roots.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-background p-4">
        <p className="text-muted text-sm">No categories in tree.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <h3 className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
        <FolderTree className="h-4 w-4 text-mint" />
        Category tree
      </h3>
      <div className="space-y-0">
        {roots.map((root) => (
          <CategoryTreeItem key={root.id} category={root} />
        ))}
      </div>
    </div>
  );
}
