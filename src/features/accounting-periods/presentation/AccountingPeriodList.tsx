"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/presentation/components/ui/input";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { useToast } from "@/presentation/providers/ToastProvider";
import { usePagination } from "@/presentation/hooks/usePagination";
import {
  useAccountingPeriods,
  useDeleteAccountingPeriod,
} from "@/presentation/hooks/useAccountingPeriods";
import type { AccountingPeriod } from "@/core/domain/entities/AccountingPeriod";
import { CreateAccountingPeriodForm } from "./CreateAccountingPeriodForm";
import { getAccountingPeriodRowActions } from "./accounting-period-row-actions";
import { getAccountingPeriodTableColumns } from "./accounting-period-table-columns";

const CREATE_FORM_ID = "create-accounting-period-form";
const SEARCH_DEBOUNCE_MS = 300;
const PAGE_SIZE = 10;

export function AccountingPeriodList() {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const del = useDeleteAccountingPeriod();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const pagination = usePagination({ pageSize: PAGE_SIZE });

  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [searchInput]);

  const { data: periodsResult, isLoading, error, refetch } = useAccountingPeriods({
    search: search || undefined,
    page: pagination.page,
    limit: PAGE_SIZE,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const periods = periodsResult?.items ?? [];

  useEffect(() => {
    pagination.reset(1);
  }, [search, pagination.reset]);

  const actions = useMemo(
    () =>
      getAccountingPeriodRowActions({
        onView: (p) => router.push(`/accounting-periods/${p.id}`),
        onEdit: (p) => router.push(`/accounting-periods/${p.id}/edit`),
        onDelete: async (p) => {
          const ok = await confirm({
            title: "Delete accounting period",
            description: `Delete "${p.periodName}"? This cannot be undone.`,
            confirmLabel: "Delete",
            variant: "destructive",
          });
          if (ok) {
            del.mutate(String(p.id), {
              onSuccess: () => toast.success("Accounting period deleted."),
              onError: () => toast.error("Failed to delete accounting period."),
            });
          }
        },
      }),
    [router, confirm, del, toast]
  );

  const columns = useMemo(
    () =>
      getAccountingPeriodTableColumns({
        onView: (p) => router.push(`/accounting-periods/${p.id}`),
      }),
    [router],
  );

  return (
    <EntityListWithCreateModal<AccountingPeriod>
      data={periods}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      loadingText="Loading accounting periods..."
      emptyText={search ? "No accounting periods match your search." : "No accounting periods yet."}
      error={
        error
          ? {
              message: "Failed to load accounting periods.",
              onRetry: () => refetch(),
            }
          : undefined
      }
      topContent={
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by period name..."
          />
        </div>
      }
      pageSize={PAGE_SIZE}
      currentPage={pagination.page}
      totalPages={periodsResult?.totalPages ?? pagination.getTotalPages(periodsResult?.total)}
      totalItems={periodsResult?.total ?? 0}
      onPageChange={pagination.setPage}
      addLabel="New Period"
      createTitle="Create Accounting Period"
      createSubmitText="Create Period"
      createLoadingText="Creating..."
      createFormId={CREATE_FORM_ID}
      createMaxWidth="2xl"
      renderCreateForm={({ formId, onSuccess, onLoadingChange }) => (
        <CreateAccountingPeriodForm
          formId={formId}
          onSuccess={onSuccess}
          onLoadingChange={onLoadingChange}
        />
      )}
    />
  );
}
