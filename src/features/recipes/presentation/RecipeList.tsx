"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/presentation/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { useToast } from "@/presentation/providers/ToastProvider";
import { usePagination } from "@/presentation/hooks/usePagination";
import { useDeleteRecipe, useRecipes } from "@/presentation/hooks/useRecipes";
import type { Recipe } from "@/core/domain/entities/Recipe";
import { CreateRecipeForm } from "./CreateRecipeForm";
import { getRecipeRowActions } from "./recipe-row-actions";
import { getRecipeTableColumns } from "./recipe-table-columns";

const CREATE_FORM_ID = "create-recipe-form";
const SEARCH_DEBOUNCE_MS = 300;
const PAGE_SIZE = 10;
const ALL = "__all__";

export function RecipeList() {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const del = useDeleteRecipe();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState(ALL);
  const pagination = usePagination({ pageSize: PAGE_SIZE });

  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [searchInput]);

  useEffect(() => {
    pagination.reset(1);
  }, [search, activeFilter, pagination.reset]);

  const { data: recipesResult, isLoading, error, refetch } = useRecipes({
    search: search || undefined,
    page: pagination.page,
    limit: PAGE_SIZE,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const recipes = recipesResult?.items ?? [];
  const filteredRecipes = useMemo(
    () =>
      activeFilter === ALL
        ? recipes
        : recipes.filter((recipe) =>
            activeFilter === "ACTIVE" ? recipe.isActive : !recipe.isActive,
          ),
    [recipes, activeFilter],
  );

  const actions = useMemo(
    () =>
      getRecipeRowActions({
        onView: (recipe) => router.push(`/recipes/${recipe.id}`),
        onEdit: (recipe) => router.push(`/recipes/${recipe.id}/edit`),
        onDelete: async (recipe) => {
          const ok = await confirm({
            title: "Delete recipe",
            description: `Delete recipe for variant "${recipe.variantId}"? This cannot be undone.`,
            confirmLabel: "Delete",
            variant: "destructive",
          });
          if (ok) {
            del.mutate(String(recipe.id), {
              onSuccess: () => toast.success("Recipe deleted."),
              onError: () => toast.error("Failed to delete recipe."),
            });
          }
        },
      }),
    [router, confirm, del, toast],
  );

  const columns = useMemo(
    () =>
      getRecipeTableColumns({
        onView: (recipe) => router.push(`/recipes/${recipe.id}`),
      }),
    [router],
  );

  return (
    <EntityListWithCreateModal<Recipe>
      data={filteredRecipes}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      loadingText="Loading recipes..."
      emptyText={search ? "No recipes match your search." : "No recipes yet."}
      error={
        error
          ? {
              message: "Failed to load recipes.",
              onRetry: () => refetch(),
            }
          : undefined
      }
      topContent={
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search recipes by variant ID..."
          />
          <Select value={activeFilter} onValueChange={setActiveFilter}>
            <SelectTrigger className="sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All statuses</SelectItem>
              <SelectItem value="ACTIVE">Active only</SelectItem>
              <SelectItem value="INACTIVE">Inactive only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      }
      pageSize={PAGE_SIZE}
      currentPage={pagination.page}
      totalPages={recipesResult?.totalPages ?? pagination.getTotalPages(recipesResult?.total)}
      totalItems={recipesResult?.total ?? 0}
      onPageChange={pagination.setPage}
      addLabel="New Recipe"
      createTitle="Create Recipe"
      createSubmitText="Create Recipe"
      createLoadingText="Creating..."
      createFormId={CREATE_FORM_ID}
      createMaxWidth="2xl"
      renderCreateForm={({ formId, onSuccess, onLoadingChange }) => (
        <CreateRecipeForm
          formId={formId}
          onSuccess={onSuccess}
          onLoadingChange={onLoadingChange}
        />
      )}
    />
  );
}
