"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  Filter,
  PencilLine,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useCategories, useDeleteCategory } from "@/presentation/hooks/useCategories";
import { useProducts } from "@/presentation/hooks/useProducts";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { Button } from "@/presentation/components/ui/button";
import { FormModal } from "@/presentation/components/modal/FormModal";
import { AppLoader } from "@/presentation/components/loader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { CreateCategoryForm } from "./CreateCategoryForm";
import { CategoryTree } from "./CategoryTree";
import type { Category } from "@/core/domain/entities/Category";

const CREATE_CATEGORY_FORM_ID = "create-category-form";
const PAGE_SIZE = 6;
const FETCH_LIMIT = 200;

type DescriptionFilter = "all" | "with-description" | "no-description";

function getDescription(category: Category) {
  const description = category.description?.trim();
  return description && description.length > 0 ? description : "No description";
}

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
  const { data: categories = [], isLoading, error, refetch } = useCategories({
    page: 1,
    limit: FETCH_LIMIT,
  });
  const { data: products = [] } = useProducts({ page: 1, limit: 500 });
  const deleteCategory = useDeleteCategory();
  const toast = useToast();
  const confirm = useConfirm();

  const [searchQuery, setSearchQuery] = useState("");
  const [descriptionFilter, setDescriptionFilter] =
    useState<DescriptionFilter>("all");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createFormLoading, setCreateFormLoading] = useState(false);

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

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCategories.length / PAGE_SIZE),
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStart = (safeCurrentPage - 1) * PAGE_SIZE;
  const paginatedCategories = filteredCategories.slice(
    pageStart,
    pageStart + PAGE_SIZE,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, descriptionFilter, selectedCategoryId]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleDelete = async (category: Category) => {
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
  };

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    descriptionFilter !== "all" ||
    selectedCategoryId !== null;

  return (
    <>
      <div className="rounded-[28px] border border-border bg-background/70 p-5 shadow-sm sm:p-8">
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
              onClick={() => setCreateModalOpen(true)}
              className="h-11 rounded-xl bg-mint px-5 text-gloss-black hover:bg-mint-hover"
            >
              <Plus className="size-4" />
              Add Category
            </Button>
          </div>
        </div>

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

        <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <div className="min-w-0">
            <CategoryTree
              selectedCategoryId={selectedCategoryId}
              onSelectCategory={setSelectedCategoryId}
            />
          </div>

          <div className="min-w-0 rounded-2xl border border-border bg-background/80 shadow-sm">
            <div className="flex flex-col gap-3 border-b border-border px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Categories
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Filter: {getFilterLabel(descriptionFilter)}
                  {selectedCategoryId ? " • Tree selection active" : ""}
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="flex min-h-[360px] items-center justify-center px-6 py-12">
                <AppLoader
                  fullScreen={false}
                  size="sm"
                  message="Loading categories..."
                />
              </div>
            ) : error ? (
              <div className="px-6 py-12 text-center">
                <p className="text-sm text-red-600">
                  Failed to load categories.
                </p>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="mt-3 inline-flex rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-mint/10"
                >
                  Retry
                </button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                          Name
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                          Description
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                          Products
                        </th>
                        <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedCategories.length > 0 ? (
                        paginatedCategories.map((category) => (
                          <tr
                            key={String(category.id)}
                            className="border-b border-border/60 last:border-0 hover:bg-mint/5"
                          >
                            <td className="px-5 py-4 align-top">
                              <button
                                type="button"
                                onClick={() => router.push(`/categories/${category.id}`)}
                                className="text-left text-sm font-semibold text-foreground transition hover:text-mint"
                              >
                                {category.name}
                              </button>
                            </td>
                            <td className="px-5 py-4 align-top">
                              <p className="max-w-[420px] text-sm leading-6 text-muted">
                                {getDescription(category)}
                              </p>
                            </td>
                            <td className="px-5 py-4 align-top text-sm text-muted">
                              {productCountByCategoryId.get(String(category.id)) ?? 0}
                            </td>
                            <td className="px-5 py-4 align-top">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => router.push(`/categories/${category.id}`)}
                                  className="inline-flex size-9 items-center justify-center rounded-lg border border-border text-muted transition hover:border-mint/40 hover:bg-mint/10 hover:text-foreground"
                                  title={`View ${category.name}`}
                                  aria-label={`View ${category.name}`}
                                >
                                  <Eye className="size-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    router.push(`/categories/${category.id}/edit`)
                                  }
                                  className="inline-flex size-9 items-center justify-center rounded-lg border border-border text-muted transition hover:border-mint/40 hover:bg-mint/10 hover:text-foreground"
                                  title={`Edit ${category.name}`}
                                  aria-label={`Edit ${category.name}`}
                                >
                                  <PencilLine className="size-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(category)}
                                  className="inline-flex size-9 items-center justify-center rounded-lg border border-border text-muted transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
                                  title={`Delete ${category.name}`}
                                  aria-label={`Delete ${category.name}`}
                                >
                                  <Trash2 className="size-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-5 py-14 text-center text-sm text-muted"
                          >
                            No categories match your current filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted">
                    Showing{" "}
                    <span className="font-medium text-foreground">
                      {filteredCategories.length === 0 ? 0 : pageStart + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium text-foreground">
                      {Math.min(pageStart + PAGE_SIZE, filteredCategories.length)}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium text-foreground">
                      {filteredCategories.length}
                    </span>{" "}
                    categories
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                      disabled={safeCurrentPage <= 1}
                      className="inline-flex h-10 items-center justify-center rounded-xl border border-border px-4 text-sm font-medium text-foreground transition hover:bg-mint/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <div className="rounded-xl bg-background px-4 py-2 text-sm font-medium text-foreground border border-border">
                      Page {safeCurrentPage} of {totalPages}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage((page) => Math.min(totalPages, page + 1))
                      }
                      disabled={safeCurrentPage >= totalPages}
                      className="inline-flex h-10 items-center justify-center rounded-xl border border-border px-4 text-sm font-medium text-foreground transition hover:bg-mint/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <FormModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Add Category"
        formId={CREATE_CATEGORY_FORM_ID}
        formContent={
          <CreateCategoryForm
            formId={CREATE_CATEGORY_FORM_ID}
            onSuccess={() => setCreateModalOpen(false)}
            onLoadingChange={setCreateFormLoading}
          />
        }
        submitText="Create Category"
        loadingText="Creating..."
        isLoading={createFormLoading}
        maxWidth="md"
      />
    </>
  );
}
