"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useCategories, useDeleteCategory } from "@/presentation/hooks/useCategories";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { Button } from "@/presentation/components/ui/button";
import { DataTable } from "@/presentation/components/data-table";
import { FormModal } from "@/presentation/components/modal/FormModal";
import { getCategoryRowActions } from "./category-row-actions";
import { getCategoryTableColumns } from "./category-table-columns";
import { CreateCategoryForm } from "./CreateCategoryForm";
import type { Category } from "@/core/domain/entities/Category";

const CREATE_CATEGORY_FORM_ID = "create-category-form";

export function CategoryList() {
  const router = useRouter();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createFormLoading, setCreateFormLoading] = useState(false);
  const { data: categories = [], isLoading, error, refetch } = useCategories();
  const deleteCategory = useDeleteCategory();
  const toast = useToast();
  const confirm = useConfirm();

  const actions = useMemo(
    () =>
      getCategoryRowActions({
        onView: (c) => router.push(`/admin/categories/${c.id}`),
        onEdit: (c) => router.push(`/admin/categories/${c.id}/edit`),
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
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>
      <DataTable<Category>
        data={categories}
        columns={columns}
        actions={actions}
        isLoading={isLoading}
        loadingText="Loading categories..."
        emptyText="No categories yet."
        emptyAction={{
          label: "Add Category",
          onClick: () => setCreateModalOpen(true),
        }}
        error={
          error
            ? {
                message: "Failed to load categories.",
                onRetry: () => refetch(),
              }
            : undefined
        }
        pageSize={10}
      />
      <FormModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Category"
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
