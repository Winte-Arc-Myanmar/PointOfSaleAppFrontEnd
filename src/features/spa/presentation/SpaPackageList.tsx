"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/presentation/components/ui/input";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import type { DataTableAction, DataTableColumn } from "@/presentation/components/data-table";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { useToast } from "@/presentation/providers/ToastProvider";
import { usePagination } from "@/presentation/hooks/usePagination";
import { useCurrency } from "@/presentation/providers/CurrencyProvider";
import {
  useCreateSpaPackage,
  useDeleteSpaPackage,
  useSpaPackages,
} from "@/presentation/hooks/useSpa";
import type { SpaPackage } from "@/core/domain/entities/Spa";
import { apiErrorMessage } from "@/lib/api-error";
import { SpaPackageForm } from "./SpaPackageForm";

const PAGE_SIZE = 20;

function CreateSpaPackageForm({
  formId,
  onSuccess,
  onLoadingChange,
}: {
  formId: string;
  onSuccess?: () => void;
  onLoadingChange?: (loading: boolean) => void;
}) {
  const create = useCreateSpaPackage();
  const toast = useToast();
  useEffect(() => onLoadingChange?.(create.isPending), [create.isPending, onLoadingChange]);
  return (
    <SpaPackageForm
      formId={formId}
      onSubmit={(data) =>
        create.mutate(data, {
          onSuccess: () => {
            toast.success(`${data.name} added.`);
            onSuccess?.();
          },
          onError: (error) => toast.error(apiErrorMessage(error, "Couldn't add the package.")),
        })
      }
    />
  );
}

export function SpaPackageList() {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const { formatPrice } = useCurrency();
  const del = useDeleteSpaPackage();
  const pagination = usePagination({ pageSize: PAGE_SIZE });
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  const { data: result, isLoading, error, refetch } = useSpaPackages({
    page: pagination.page,
    limit: PAGE_SIZE,
    search: search || undefined,
  });

  const columns = useMemo<DataTableColumn<SpaPackage>[]>(
    () => [
      {
        key: "name",
        header: "Package",
        render: (p) => (
          <button type="button" className="text-left hover:text-mint" onClick={() => router.push(`/spa-packages/${p.id}/edit`)}>
            <span className="block font-medium">{p.name}</span>
            {p.items.length ? (
              <span className="block text-xs text-muted">
                + {p.items.map((i) => `${i.quantity} × ${i.name}`).join(", ")}
              </span>
            ) : null}
          </button>
        ),
      },
      { key: "durationMinutes", header: "Time", render: (p) => <span className="text-sm">{p.durationMinutes} min</span> },
      { key: "price", header: "Price", render: (p) => <span className="text-sm font-medium">{formatPrice(p.price)}</span> },
      {
        key: "isActive",
        header: "Status",
        render: (p) => (
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
              p.isActive ? "bg-emerald-100 text-emerald-800" : "bg-muted text-muted-foreground"
            }`}
          >
            {p.isActive ? "On sale" : "Not on sale"}
          </span>
        ),
      },
    ],
    [formatPrice, router],
  );

  const actions = useMemo<DataTableAction<SpaPackage>[]>(
    () => [
      { label: "Edit", onClick: (p) => router.push(`/spa-packages/${p.id}/edit`) },
      {
        label: "Remove",
        variant: "destructive",
        onClick: async (p) => {
          const ok = await confirm({
            title: "Remove package",
            description: `Remove "${p.name}"? Past sales stay in reports.`,
            confirmLabel: "Remove",
            variant: "destructive",
          });
          if (ok) {
            del.mutate(p.id, {
              onSuccess: () => toast.success(`${p.name} removed.`),
              onError: (err) => toast.error(apiErrorMessage(err, "Couldn't remove the package.")),
            });
          }
        },
      },
    ],
    [router, confirm, del, toast],
  );

  return (
    <EntityListWithCreateModal<SpaPackage>
      data={result?.items ?? []}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      loadingText="Loading packages..."
      emptyText={search ? "No packages match your search." : "No packages yet. Add your first treatment, e.g. Thai massage 90 min."}
      error={error ? { message: apiErrorMessage(error, "Failed to load packages."), onRetry: () => refetch() } : undefined}
      topContent={
        <div className="mb-4">
          <Input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search packages..." />
        </div>
      }
      pageSize={PAGE_SIZE}
      currentPage={pagination.page}
      totalPages={result?.totalPages ?? pagination.getTotalPages(result?.total)}
      totalItems={result?.total ?? 0}
      onPageChange={pagination.setPage}
      addLabel="Add package"
      createTitle="Add a service package"
      createSubmitText="Add package"
      createLoadingText="Adding..."
      createFormId="create-spa-package-form"
      createMaxWidth="2xl"
      renderCreateForm={({ formId, onSuccess, onLoadingChange }) => (
        <CreateSpaPackageForm formId={formId} onSuccess={onSuccess} onLoadingChange={onLoadingChange} />
      )}
    />
  );
}
