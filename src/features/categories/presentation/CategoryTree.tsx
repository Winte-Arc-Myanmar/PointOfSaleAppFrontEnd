"use client";

import { Fragment, useState } from "react";
import { ChevronDown, ChevronRight, FolderTree, List } from "lucide-react";
import { useCategoryTree } from "@/presentation/hooks/useCategories";
import type { Category } from "@/core/domain/entities/Category";
import { AppLoader } from "@/presentation/components/loader";
import { cn } from "@/lib/utils";

interface CategoryTreeProps {
  selectedCategoryId?: string | null;
  onSelectCategory?: (categoryId: string | null) => void;
}

function TreeNode({
  category,
  depth,
  selectedCategoryId,
  onSelectCategory,
}: {
  category: Category;
  depth: number;
  selectedCategoryId?: string | null;
  onSelectCategory?: (id: string | null) => void;
}) {
  const childCount = 0;
  const isSelected = selectedCategoryId === String(category.id);

  return (
    <Fragment>
      <li>
        <button
          type="button"
          onClick={() => onSelectCategory?.(isSelected ? null : String(category.id))}
          className={cn(
            "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition",
            "focus:outline-none focus:ring-2 focus:ring-mint/50 focus:ring-offset-0",
            isSelected
              ? "bg-mint/15 text-foreground"
              : "text-muted hover:bg-mint/5 hover:text-foreground",
          )}
          style={{ paddingLeft: `${12 + depth * 24}px` }}
          title={category.name}
        >
          <span
            aria-hidden="true"
            className={cn(
              "mt-0.5 size-2 shrink-0 rounded-full transition-colors",
              isSelected
                ? "bg-mint"
                : "bg-muted/60 group-hover:bg-mint",
            )}
          />
          <span className="min-w-0 truncate text-sm font-semibold">
            {category.name}
          </span>
          <span
            className={cn(
              "shrink-0 text-sm",
              isSelected ? "text-mint" : "text-muted",
            )}
          >
            ({childCount})
          </span>
        </button>
      </li>

      {category.children?.map((child) => (
        <TreeNode
          key={String(child.id)}
          category={child}
          depth={depth + 1}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={onSelectCategory}
        />
      ))}
    </Fragment>
  );
}

export function CategoryTree({
  selectedCategoryId,
  onSelectCategory,
}: CategoryTreeProps) {
  const { data: roots = [], isLoading, error, refetch } = useCategoryTree();
  const [isOpen, setIsOpen] = useState(true);

  if (isLoading) {
    return (
      <div className="flex min-h-24 items-center justify-center rounded-2xl border border-border bg-background/80 p-6 shadow-sm">
        <AppLoader
          fullScreen={false}
          size="sm"
          message="Loading category tree..."
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-border bg-background/80 p-6 shadow-sm">
        <p className="text-sm text-red-600">Failed to load category tree.</p>
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
      <div className="rounded-2xl border border-border bg-background/80 p-6 shadow-sm">
        <p className="text-sm text-muted">
          No categories in tree.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-background/80 p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-mint/10 text-mint">
            <FolderTree className="size-4" strokeWidth={2.2} />
          </div>
          <div>
            <button
              type="button"
              onClick={() => onSelectCategory?.(null)}
              className="text-left"
              title="Show all categories"
            >
              <h2 className="text-lg font-semibold tracking-tight text-foreground hover:text-mint">
                Category Tree
              </h2>
            </button>
            <p className="mt-1 text-sm text-muted">
              Browse or focus one category at a time.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-border px-3 text-sm font-medium text-foreground transition hover:bg-mint/10"
        >
          {isOpen ? (
            <ChevronDown className="size-4" />
          ) : (
            <ChevronRight className="size-4" />
          )}
          {isOpen ? "Hide" : "Show"}
        </button>
      </div>

      {isOpen ? (
        <ul className="space-y-1">
          <li>
            <button
              type="button"
              onClick={() => onSelectCategory?.(null)}
              className={cn(
                "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition",
                "focus:outline-none focus:ring-2 focus:ring-mint/50 focus:ring-offset-0",
                selectedCategoryId === null
                  ? "bg-mint/15 text-foreground"
                  : "text-muted hover:bg-mint/5 hover:text-foreground",
              )}
              title="Show all categories"
            >
              <List
                className={cn(
                  "size-4 shrink-0",
                  selectedCategoryId === null ? "text-mint" : "text-muted",
                )}
              />
              <span className="min-w-0 truncate text-sm font-semibold">
                All categories
              </span>
            </button>
          </li>
          {roots.map((category) => (
            <TreeNode
              key={String(category.id)}
              category={category}
              depth={0}
              selectedCategoryId={selectedCategoryId}
              onSelectCategory={onSelectCategory}
            />
          ))}
        </ul>
      ) : null}
    </div>
  );
}
