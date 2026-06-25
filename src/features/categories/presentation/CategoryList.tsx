"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Filter, Plus, Search, X } from "lucide-react";
import { useCategories, useDeleteCategory } from "@/presentation/hooks/useCategories";
import { useProducts } from "@/presentation/hooks/useProducts";
import { usePagination } from "@/presentation/hooks/usePagination";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { Button } from "@/presentation/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import { CreateCategoryForm } from "./CreateCategoryForm";
import { CategoryTree } from "./CategoryTree";
import {
  getCategoryInlineActionsColumn,
  getCategoryTableColumns,
} from "./category-table-columns";
import type { Category } from "@/core/domain/entities/Category";

const CREATE_CATEGORY_FORM_ID = "create-category-form";
const PAGE_SIZE = 6;

type DescriptionFilter = "all" | "with-description" | "no-description";

function getFilterLabel(value: DescriptionFilter) {
  switch (value) {
    case "with-description":
      return "With description";
    case "no-description":
      return "No description";
    default:
      return "All categories";
  }
}

export function CategoryList() {
  const router = useRouter();
  const pagination = usePagination({ pageSize: PAGE_SIZE });
  const { data: categoriesResult, isLoading, error, refetch } = useCategories({
    page: pagination.page,
    limit: PAGE_SIZE,
  });
  const { data: productsResult } = useProducts({ page: 1, limit: 500 });
  const categories = categoriesResult?.items ?? [];
  const products = productsResult?.items ?? [];
  const deleteCategory = useDeleteCategory();
  const toast = useToast();
  const confirm = useConfirm();

  const [searchQuery, setSearchQuery] = useState("");
  const [descriptionFilter, setDescriptionFilter] =
    useState<DescriptionFilter>("all");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );

  const productCountByCategoryId = useMemo(() => {
    const counts = new Map<string, number>();
    for (const product of products) {
      const categoryId = String(product.categoryId);
      counts.set(categoryId, (counts.get(categoryId) ?? 0) + 1);
    }
    return counts;
  }, [products]);

  const filteredCategories = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return categories.filter((category) => {
      const description = category.description?.trim() ?? "";
      const matchesSearch =
        normalizedSearch.length === 0 ||
        category.name.toLowerCase().includes(normalizedSearch) ||
        description.toLowerCase().includes(normalizedSearch);

      const matchesDescriptionFilter =
        descriptionFilter === "all" ||
        (descriptionFilter === "with-description" && description.length > 0) ||
        (descriptionFilter === "no-description" && description.length === 0);

      const matchesSelectedCategory =
        !selectedCategoryId || String(category.id) === selectedCategoryId;

      return (
        matchesSearch && matchesDescriptionFilter && matchesSelectedCategory
      );
    });
  }, [categories, descriptionFilter, searchQuery, selectedCategoryId]);

  useEffect(() => {
    pagination.reset(1);
  }, [searchQuery, descriptionFilter, selectedCategoryId, pagination.reset]);

  const handleDelete = useCallback(
    async (category: Category) => {
      const ok = await confirm({
        title: "Delete category",
        description: `Delete "${category.name}"? This cannot be undone.`,
        confirmLabel: "Delete",
        variant: "destructive",
      });

      if (!ok) return;

      deleteCategory.mutate(String(category.id), {
        onSuccess: () => toast.success("Category deleted."),
        onError: () => toast.error("Failed to delete category."),
      });
    },
    [confirm, deleteCategory, toast],
  );

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    descriptionFilter !== "all" ||
    selectedCategoryId !== null;

  const columns = useMemo(
    () => [
      ...getCategoryTableColumns({
        onView: (category) => router.push(`/categories/${category.id}`),
        productCountByCategoryId,
      }),
      getCategoryInlineActionsColumn({
        onView: (category) => router.push(`/categories/${category.id}`),
        onEdit: (category) => router.push(`/categories/${category.id}/edit`),
        onDelete: handleDelete,
      }),
    ],
    [router, productCountByCategoryId, handleDelete],
  );

  return (
    <EntityListWithCreateModal<Category>
      data={filteredCategories}
      columns={columns}
      actions={[]}
      isLoading={isLoading}
      loadingText="Loading categories..."
      emptyText="No categories match your current filters."
      error={
        error
          ? {
              message: "Failed to load categories.",
              onRetry: () => refetch(),
            }
          : undefined
      }
      pageSize={PAGE_SIZE}
      currentPage={pagination.page}
      totalPages={
        categoriesResult?.totalPages ?? pagination.getTotalPages(categoriesResult?.total)
      }
      totalItems={categoriesResult?.total ?? 0}
      onPageChange={pagination.setPage}
      showActionBar={false}
      addLabel="Add Category"
      createTitle="Add Category"
      createSubmitText="Create Category"
      createLoadingText="Creating..."
      createFormId={CREATE_CATEGORY_FORM_ID}
      renderCreateForm={({ formId, onSuccess, onLoadingChange }) => (
        <CreateCategoryForm
          formId={formId}
          onSuccess={onSuccess}
          onLoadingChange={onLoadingChange}
        />
      )}
      rootClassName="rounded-[28px] border border-border bg-background/70 p-5 shadow-sm sm:p-8"
      renderPageHeader={({ openCreate }) => (
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-muted">
              Categories
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Categories Management
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-muted">
              Organize your catalog with a cleaner category structure, faster
              browsing, and clearer actions for your team.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-border bg-background/80 px-4 py-2 text-sm text-muted">
              {filteredCategories.length} categories
            </div>
            <Button
              type="button"
              onClick={openCreate}
              className="h-11 rounded-xl bg-mint px-5 text-gloss-black hover:bg-mint-hover"
            >
              <Plus className="size-4" />
              Add Category
            </Button>
          </div>
        </div>
      )}
      topContent={
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-border bg-background/80 p-4 shadow-sm md:flex-row md:items-center">
          <label className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search categories by name or description"
              className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-mint focus:ring-4 focus:ring-mint/20"
            />
          </label>

          <div className="min-w-[220px]">
            <Select
              value={descriptionFilter}
              onValueChange={(value) =>
                setDescriptionFilter(value as DescriptionFilter)
              }
            >
              <SelectTrigger className="h-11 rounded-xl border-border bg-background text-foreground">
                <div className="flex items-center gap-3">
                  <Filter className="size-4 text-muted" />
                  <SelectValue placeholder="All categories" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                <SelectItem value="with-description">With description</SelectItem>
                <SelectItem value="no-description">No description</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters ? (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setDescriptionFilter("all");
                setSelectedCategoryId(null);
              }}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-medium text-foreground transition hover:bg-mint/10"
            >
              <X className="size-4" />
              Clear filters
            </button>
          ) : null}
        </div>
      }
      sidebarContent={
        <CategoryTree
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
        />
      }
      tablePanelClassName="rounded-2xl border border-border bg-background/80 shadow-sm"
      tableContentClassName="px-5 pb-5"
      tablePanelHeader={
        <div className="flex flex-col gap-3 border-b border-border px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Categories</h2>
            <p className="mt-1 text-sm text-muted">
              Filter: {getFilterLabel(descriptionFilter)}
              {selectedCategoryId ? " • Tree selection active" : ""}
            </p>
          </div>
        </div>
      }
    />
  );
}
