"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/presentation/components/ui/input";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useInferredServerPagination } from "@/presentation/hooks/useInferredServerPagination";
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
  const pagination = useInferredServerPagination({ pageSize: PAGE_SIZE });

  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [searchInput]);

  const { data: accounts = [], isLoading, error, refetch } = useChartOfAccounts({
    search: search || undefined,
    page: pagination.page,
    limit: PAGE_SIZE,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  useEffect(() => {
    pagination.observePageResult(accounts.length);
  }, [accounts.length, pagination]);

  useEffect(() => {
    pagination.reset(1);
  }, [search, pagination]);

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

  const columns = useMemo(() => getChartOfAccountTableColumns(), []);

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
      pageSize={10}
      currentPage={pagination.page}
      totalPages={pagination.totalPages}
      totalItems={pagination.totalItems}
      onPageChange={(p) => pagination.setPage(p)}
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

