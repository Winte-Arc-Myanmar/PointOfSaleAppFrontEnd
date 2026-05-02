"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/presentation/components/ui/input";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useInferredServerPagination } from "@/presentation/hooks/useInferredServerPagination";
import {
  useDeletePromotionRule,
  usePromotionRules,
} from "@/presentation/hooks/usePromotionRules";
import type { PromotionRule } from "@/core/domain/entities/PromotionRule";
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
  const pagination = useInferredServerPagination({ pageSize: PAGE_SIZE });

  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [searchInput]);

  const { data: rules = [], isLoading, error, refetch } = usePromotionRules({
    search: search || undefined,
    page: pagination.page,
    limit: PAGE_SIZE,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  useEffect(() => {
    pagination.observePageResult(rules.length);
  }, [rules.length, pagination]);

  useEffect(() => {
    pagination.reset(1);
  }, [search, pagination]);

  const actions = useMemo(
    () =>
      getPromotionRuleRowActions({
        onView: (r) => router.push(`/promotion-rules/${r.id}`),
        onEdit: (r) => router.push(`/promotion-rules/${r.id}/edit`),
        onDelete: async (r) => {
          const ok = await confirm({
            title: "Delete promotion rule",
            description: `Delete "${r.name}"? This cannot be undone.`,
            confirmLabel: "Delete",
            variant: "destructive",
          });
          if (ok) {
            del.mutate(String(r.id), {
              onSuccess: () => toast.success("Promotion rule deleted."),
              onError: () => toast.error("Failed to delete promotion rule."),
            });
          }
        },
      }),
    [router, confirm, del, toast]
  );

  const columns = useMemo(() => getPromotionRuleTableColumns(), []);

  return (
    <EntityListWithCreateModal<PromotionRule>
      data={rules}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      loadingText="Loading promotion rules..."
      emptyText={search ? "No rules match your search." : "No promotion rules yet."}
      error={
        error
          ? {
              message: "Failed to load promotion rules.",
              onRetry: () => refetch(),
            }
          : undefined
      }
      topContent={
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search promotion rules..."
          />
        </div>
      }
      pageSize={10}
      currentPage={pagination.page}
      totalPages={pagination.totalPages}
      totalItems={pagination.totalItems}
      onPageChange={(p) => pagination.setPage(p)}
      addLabel="New Rule"
      createTitle="Create Promotion Rule"
      createSubmitText="Create Rule"
      createLoadingText="Creating..."
      createFormId={CREATE_FORM_ID}
      createMaxWidth="2xl"
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

