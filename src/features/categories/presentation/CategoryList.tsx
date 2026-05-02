"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useCategories, useDeleteCategory } from "@/presentation/hooks/useCategories";
import { useInferredServerPagination } from "@/presentation/hooks/useInferredServerPagination";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import { getCategoryRowActions } from "./category-row-actions";
import { getCategoryTableColumns } from "./category-table-columns";
import { CreateCategoryForm } from "./CreateCategoryForm";
import type { Category } from "@/core/domain/entities/Category";

const CREATE_CATEGORY_FORM_ID = "create-category-form";
const PAGE_SIZE = 10;

export function CategoryList() {
  const router = useRouter();
  const pagination = useInferredServerPagination({ pageSize: PAGE_SIZE });
  const { data: categories = [], isLoading, error, refetch } = useCategories({
    page: pagination.page,
    limit: PAGE_SIZE,
  });
  const deleteCategory = useDeleteCategory();
  const toast = useToast();
  const confirm = useConfirm();

  useEffect(() => {
    pagination.observePageResult(categories.length);
  }, [categories.length, pagination]);

  const actions = useMemo(
    () =>
      getCategoryRowActions({
        onView: (c) => router.push(`/categories/${c.id}`),
        onEdit: (c) => router.push(`/categories/${c.id}/edit`),
        onDelete: async (c) => {
          const ok = await confirm({
            title: "Delete category",
            description: `Delete "${c.name}"? This cannot be undone.`,
            confirmLabel: "Delete",
            variant: "destructive",
          });
          if (ok) {
            deleteCategory.mutate(c.id, {
              onSuccess: () => toast.success("Category deleted."),
              onError: () => toast.error("Failed to delete category."),
            });
          }
        },
      }),
    [router, deleteCategory, toast, confirm]
  );

  const columns = useMemo(() => getCategoryTableColumns(), []);

  return (
    <EntityListWithCreateModal<Category>
      data={categories}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      loadingText="Loading categories..."
      emptyText="No categories yet."
      error={
        error
          ? {
              message: "Failed to load categories.",
              onRetry: () => refetch(),
            }
          : undefined
      }
      pageSize={10}
      currentPage={pagination.page}
      totalPages={pagination.totalPages}
      totalItems={pagination.totalItems}
      onPageChange={(p) => pagination.setPage(p)}
      addLabel="Add Category"
      createTitle="Create Category"
      createSubmitText="Create Category"
      createLoadingText="Creating..."
      createFormId={CREATE_CATEGORY_FORM_ID}
      createMaxWidth="md"
      renderCreateForm={({ formId, onSuccess, onLoadingChange }) => (
        <CreateCategoryForm
          formId={formId}
          onSuccess={onSuccess}
          onLoadingChange={onLoadingChange}
        />
      )}
    />
  );
}
