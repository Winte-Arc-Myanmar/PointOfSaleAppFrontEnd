"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/presentation/components/ui/input";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { useToast } from "@/presentation/providers/ToastProvider";
import { usePagination } from "@/presentation/hooks/usePagination";
import {
  useExchangeRates,
  useDeleteExchangeRate,
} from "@/presentation/hooks/useExchangeRates";
import type { ExchangeRate } from "@/core/domain/entities/ExchangeRate";
import { CreateExchangeRateForm } from "./CreateExchangeRateForm";
import { getExchangeRateRowActions } from "./exchange-rate-row-actions";
import { getExchangeRateTableColumns } from "./exchange-rate-table-columns";

const CREATE_FORM_ID = "create-exchange-rate-form";
const SEARCH_DEBOUNCE_MS = 300;
const PAGE_SIZE = 10;

export function ExchangeRateList() {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const del = useDeleteExchangeRate();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const pagination = usePagination({ pageSize: PAGE_SIZE });

  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [searchInput]);

  const { data: ratesResult, isLoading, error, refetch } = useExchangeRates({
    search: search || undefined,
    page: pagination.page,
    limit: PAGE_SIZE,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const rates = ratesResult?.items ?? [];

  useEffect(() => {
    pagination.reset(1);
  }, [search, pagination.reset]);

  const actions = useMemo(
    () =>
      getExchangeRateRowActions({
        onView: (r) => router.push(`/exchange-rates/${r.id}`),
        onEdit: (r) => router.push(`/exchange-rates/${r.id}/edit`),
        onDelete: async (r) => {
          const ok = await confirm({
            title: "Delete exchange rate",
            description: `Delete ${r.baseCurrency}/${r.targetCurrency} rate? This cannot be undone.`,
            confirmLabel: "Delete",
            variant: "destructive",
          });
          if (ok) {
            del.mutate(String(r.id), {
              onSuccess: () => toast.success("Exchange rate deleted."),
              onError: () => toast.error("Failed to delete exchange rate."),
            });
          }
        },
      }),
    [router, confirm, del, toast]
  );

  const columns = useMemo(
    () =>
      getExchangeRateTableColumns({
        onView: (r) => router.push(`/exchange-rates/${r.id}`),
      }),
    [router],
  );

  return (
    <EntityListWithCreateModal<ExchangeRate>
      data={rates}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      loadingText="Loading exchange rates..."
      emptyText={search ? "No exchange rates match your search." : "No exchange rates yet."}
      error={
        error
          ? {
              message: "Failed to load exchange rates.",
              onRetry: () => refetch(),
            }
          : undefined
      }
      topContent={
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by currency..."
          />
        </div>
      }
      pageSize={PAGE_SIZE}
      currentPage={pagination.page}
      totalPages={ratesResult?.totalPages ?? pagination.getTotalPages(ratesResult?.total)}
      totalItems={ratesResult?.total ?? 0}
      onPageChange={pagination.setPage}
      addLabel="New Rate"
      createTitle="Create Exchange Rate"
      createSubmitText="Create Rate"
      createLoadingText="Creating..."
      createFormId={CREATE_FORM_ID}
      createMaxWidth="2xl"
      renderCreateForm={({ formId, onSuccess, onLoadingChange }) => (
        <CreateExchangeRateForm
          formId={formId}
          onSuccess={onSuccess}
          onLoadingChange={onLoadingChange}
        />
      )}
    />
  );
}
