"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/presentation/components/ui/input";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { useToast } from "@/presentation/providers/ToastProvider";
import { usePagination } from "@/presentation/hooks/usePagination";
import {
  useReconciliationMatches,
  useDeleteReconciliationMatch,
} from "@/presentation/hooks/useReconciliationMatches";
import type { ReconciliationMatch } from "@/core/domain/entities/ReconciliationMatch";
import { CreateReconciliationMatchForm } from "./CreateReconciliationMatchForm";
import { getReconciliationMatchRowActions } from "./reconciliation-match-row-actions";
import { getReconciliationMatchTableColumns } from "./reconciliation-match-table-columns";

const CREATE_FORM_ID = "create-reconciliation-match-form";
const SEARCH_DEBOUNCE_MS = 300;
const PAGE_SIZE = 10;

export function ReconciliationMatchList() {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const del = useDeleteReconciliationMatch();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const pagination = usePagination({ pageSize: PAGE_SIZE });

  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [searchInput]);

  const { data: matchesResult, isLoading, error, refetch } = useReconciliationMatches({
    search: search || undefined,
    page: pagination.page,
    limit: PAGE_SIZE,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const matches = matchesResult?.items ?? [];

  useEffect(() => {
    pagination.reset(1);
  }, [search, pagination.reset]);

  const actions = useMemo(
    () =>
      getReconciliationMatchRowActions({
        onView: (m) => router.push(`/reconciliation-matches/${m.id}`),
        onEdit: (m) => router.push(`/reconciliation-matches/${m.id}/edit`),
        onDelete: async (m) => {
          const ok = await confirm({
            title: "Delete reconciliation match",
            description: "Delete this reconciliation match? This cannot be undone.",
            confirmLabel: "Delete",
            variant: "destructive",
          });
          if (ok) {
            del.mutate(String(m.id), {
              onSuccess: () => toast.success("Reconciliation match deleted."),
              onError: () => toast.error("Failed to delete reconciliation match."),
            });
          }
        },
      }),
    [router, confirm, del, toast]
  );

  const columns = useMemo(
    () =>
      getReconciliationMatchTableColumns({
        onView: (m) => router.push(`/reconciliation-matches/${m.id}`),
      }),
    [router],
  );

  return (
    <EntityListWithCreateModal<ReconciliationMatch>
      data={matches}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      loadingText="Loading reconciliation matches..."
      emptyText={
        search ? "No reconciliation matches match your search." : "No reconciliation matches yet."
      }
      error={
        error
          ? {
              message: "Failed to load reconciliation matches.",
              onRetry: () => refetch(),
            }
          : undefined
      }
      topContent={
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search reconciliation matches..."
          />
        </div>
      }
      pageSize={PAGE_SIZE}
      currentPage={pagination.page}
      totalPages={matchesResult?.totalPages ?? pagination.getTotalPages(matchesResult?.total)}
      totalItems={matchesResult?.total ?? 0}
      onPageChange={pagination.setPage}
      addLabel="New Match"
      createTitle="Create Reconciliation Match"
      createSubmitText="Create Match"
      createLoadingText="Creating..."
      createFormId={CREATE_FORM_ID}
      createMaxWidth="2xl"
      renderCreateForm={({ formId, onSuccess, onLoadingChange }) => (
        <CreateReconciliationMatchForm
          formId={formId}
          onSuccess={onSuccess}
          onLoadingChange={onLoadingChange}
        />
      )}
    />
  );
}
