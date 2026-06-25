"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/presentation/components/ui/input";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { useToast } from "@/presentation/providers/ToastProvider";
import { usePagination } from "@/presentation/hooks/usePagination";
import { useTaxRates, useDeleteTaxRate } from "@/presentation/hooks/useTaxRates";
import type { TaxRate } from "@/core/domain/entities/TaxRate";
import { CreateTaxRateForm } from "./CreateTaxRateForm";
import { getTaxRateRowActions } from "./tax-rate-row-actions";
import { getTaxRateTableColumns } from "./tax-rate-table-columns";

const CREATE_FORM_ID = "create-tax-rate-form";
const SEARCH_DEBOUNCE_MS = 300;
const PAGE_SIZE = 10;

export function TaxRateList() {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const del = useDeleteTaxRate();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const pagination = usePagination({ pageSize: PAGE_SIZE });

  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [searchInput]);

  const { data: ratesResult, isLoading, error, refetch } = useTaxRates({
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
      getTaxRateRowActions({
        onView: (r) => router.push(`/tax-rates/${r.id}`),
        onEdit: (r) => router.push(`/tax-rates/${r.id}/edit`),
        onDelete: async (r) => {
          const ok = await confirm({
            title: "Delete tax rate",
            description: `Delete "${r.name}"? This cannot be undone.`,
            confirmLabel: "Delete",
            variant: "destructive",
          });
          if (ok) {
            del.mutate(String(r.id), {
              onSuccess: () => toast.success("Tax rate deleted."),
              onError: () => toast.error("Failed to delete tax rate."),
            });
          }
        },
      }),
    [router, confirm, del, toast]
  );

  const columns = useMemo(
    () =>
      getTaxRateTableColumns({
        onView: (r) => router.push(`/tax-rates/${r.id}`),
      }),
    [router],
  );

  return (
    <EntityListWithCreateModal<TaxRate>
      data={rates}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      loadingText="Loading tax rates..."
      emptyText={search ? "No tax rates match your search." : "No tax rates yet."}
      error={
        error
          ? {
              message: "Failed to load tax rates.",
              onRetry: () => refetch(),
            }
          : undefined
      }
      topContent={
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name..."
          />
        </div>
      }
      pageSize={PAGE_SIZE}
      currentPage={pagination.page}
      totalPages={ratesResult?.totalPages ?? pagination.getTotalPages(ratesResult?.total)}
      totalItems={ratesResult?.total ?? 0}
      onPageChange={pagination.setPage}
      addLabel="New Tax Rate"
      createTitle="Create Tax Rate"
      createSubmitText="Create Tax Rate"
      createLoadingText="Creating..."
      createFormId={CREATE_FORM_ID}
      createMaxWidth="2xl"
      renderCreateForm={({ formId, onSuccess, onLoadingChange }) => (
        <CreateTaxRateForm
          formId={formId}
          onSuccess={onSuccess}
          onLoadingChange={onLoadingChange}
        />
      )}
    />
  );
}
