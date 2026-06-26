"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/presentation/components/ui/input";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { useToast } from "@/presentation/providers/ToastProvider";
import { usePagination } from "@/presentation/hooks/usePagination";
import {
  useChartOfAccounts,
  useDeleteChartOfAccount,
} from "@/presentation/hooks/useChartOfAccounts";
import type { ChartOfAccount } from "@/core/domain/entities/ChartOfAccount";
import { CreateChartOfAccountForm } from "./CreateChartOfAccountForm";
import { getChartOfAccountRowActions } from "./chart-of-account-row-actions";
import { getChartOfAccountTableColumns } from "./chart-of-account-table-columns";

const CREATE_FORM_ID = "create-chart-of-account-form";
const SEARCH_DEBOUNCE_MS = 300;
const PAGE_SIZE = 10;

export function ChartOfAccountList() {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const del = useDeleteChartOfAccount();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const pagination = usePagination({ pageSize: PAGE_SIZE });

  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [searchInput]);

  const { data: accountsResult, isLoading, error, refetch } = useChartOfAccounts({
    search: search || undefined,
    page: pagination.page,
    limit: PAGE_SIZE,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const accounts = accountsResult?.items ?? [];

  useEffect(() => {
    pagination.reset(1);
  }, [search, pagination.reset]);

  const actions = useMemo(
    () =>
      getChartOfAccountRowActions({
        onView: (a) => router.push(`/chart-of-accounts/${a.id}`),
        onEdit: (a) => router.push(`/chart-of-accounts/${a.id}/edit`),
        onDelete: async (a) => {
          const ok = await confirm({
            title: "Delete chart account",
            description: `Delete "${a.accountCode} - ${a.accountName}"? This cannot be undone.`,
            confirmLabel: "Delete",
            variant: "destructive",
          });
          if (ok) {
            del.mutate(String(a.id), {
              onSuccess: () => toast.success("Chart account deleted."),
              onError: () => toast.error("Failed to delete chart account."),
            });
          }
        },
      }),
    [router, confirm, del, toast]
  );

  const columns = useMemo(
    () =>
      getChartOfAccountTableColumns({
        onView: (a) => router.push(`/chart-of-accounts/${a.id}`),
      }),
    [router],
  );

  return (
    <EntityListWithCreateModal<ChartOfAccount>
      data={accounts}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      loadingText="Loading chart of accounts..."
      emptyText={search ? "No chart accounts match your search." : "No chart accounts yet."}
      error={
        error
          ? {
              message: "Failed to load chart of accounts.",
              onRetry: () => refetch(),
            }
          : undefined
      }
      topContent={
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by code, name, or type..."
          />
        </div>
      }
      pageSize={PAGE_SIZE}
      currentPage={pagination.page}
      totalPages={accountsResult?.totalPages ?? pagination.getTotalPages(accountsResult?.total)}
      totalItems={accountsResult?.total ?? 0}
      onPageChange={pagination.setPage}
      addLabel="New Account"
      createTitle="Create Chart Account"
      createSubmitText="Create Account"
      createLoadingText="Creating..."
      createFormId={CREATE_FORM_ID}
      createMaxWidth="2xl"
      renderCreateForm={({ formId, onSuccess, onLoadingChange }) => (
        <CreateChartOfAccountForm
          formId={formId}
          onSuccess={onSuccess}
          onLoadingChange={onLoadingChange}
        />
      )}
    />
  );
}

