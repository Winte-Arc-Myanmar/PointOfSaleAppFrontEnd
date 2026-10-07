"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/presentation/components/ui/input";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { useToast } from "@/presentation/providers/ToastProvider";
import { usePagination } from "@/presentation/hooks/usePagination";
import {
  useDeletePromotionRule,
  usePromotionRules,
} from "@/presentation/hooks/usePromotionRules";
import type { PromotionRule } from "@/core/domain/entities/PromotionRule";
import { useCurrency } from "@/presentation/providers/CurrencyProvider";
import { useCategories } from "@/presentation/hooks/useCategories";
import { getPaginatedItems } from "@/presentation/hooks/pagination";
import { CreatePromotionRuleForm } from "./CreatePromotionRuleForm";
import { getPromotionRuleRowActions } from "./promotion-rule-row-actions";
import { getPromotionRuleTableColumns } from "./promotion-rule-table-columns";

const CREATE_FORM_ID = "create-promotion-rule-form";
const SEARCH_DEBOUNCE_MS = 300;
const PAGE_SIZE = 10;

export function PromotionRuleList() {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const del = useDeletePromotionRule();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const pagination = usePagination({ pageSize: PAGE_SIZE });

  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [searchInput]);

  const { data: rulesResult, isLoading, error, refetch } = usePromotionRules({
    search: search || undefined,
    page: pagination.page,
    limit: PAGE_SIZE,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const rules = rulesResult?.items ?? [];

  useEffect(() => {
    pagination.reset(1);
  }, [search, pagination.reset]);

  const actions = useMemo(
    () =>
      getPromotionRuleRowActions({
        onView: (r) => router.push(`/promotion-rules/${r.id}`),
        onEdit: (r) => router.push(`/promotion-rules/${r.id}/edit`),
        onDelete: async (r) => {
          const ok = await confirm({
            title: "Remove promotion",
            description: `Remove "${r.name}"? It stops applying. Past sales still show what it took off.`,
            confirmLabel: "Remove",
            variant: "destructive",
          });
          if (ok) {
            del.mutate(String(r.id), {
              onSuccess: () => toast.success(`${r.name} removed.`),
              onError: () => toast.error("Couldn't remove the promotion."),
            });
          }
        },
      }),
    [router, confirm, del, toast]
  );

  const { formatPrice } = useCurrency();
  const { data: categoriesData } = useCategories({ page: 1, limit: 500 });
  const columns = useMemo(() => {
    const names = new Map(getPaginatedItems(categoriesData).map((c) => [String(c.id), c.name]));
    return getPromotionRuleTableColumns({
      onView: (r) => router.push(`/promotion-rules/${r.id}`),
      formatPrice,
      categoryName: (id) => names.get(id) ?? "Unknown category",
    });
  }, [router, formatPrice, categoriesData]);

  return (
    <EntityListWithCreateModal<PromotionRule>
      data={rules}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      loadingText="Loading promotions..."
      emptyText={search ? "No promotions match your search." : "No promotions yet. Add one, e.g. Happy hour drinks 20% off."}
      error={
        error
          ? {
              message: "Couldn't load promotions.",
              onRetry: () => refetch(),
            }
          : undefined
      }
      topContent={
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search promotions..."
          />
        </div>
      }
      pageSize={PAGE_SIZE}
      currentPage={pagination.page}
      totalPages={rulesResult?.totalPages ?? pagination.getTotalPages(rulesResult?.total)}
      totalItems={rulesResult?.total ?? 0}
      onPageChange={pagination.setPage}
      addLabel="Add promotion"
      createTitle="Add a promotion"
      createSubmitText="Add promotion"
      createLoadingText="Adding..."
      createFormId={CREATE_FORM_ID}
      createMaxWidth="4xl"
      renderCreateForm={({ formId, onSuccess, onLoadingChange }) => (
        <CreatePromotionRuleForm
          formId={formId}
          onSuccess={onSuccess}
          onLoadingChange={onLoadingChange}
        />
      )}
    />
  );
}

