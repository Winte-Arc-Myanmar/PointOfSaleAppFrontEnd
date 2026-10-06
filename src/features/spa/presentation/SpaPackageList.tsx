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
import { cn } from "@/lib/utils";
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
  const [onSale, setOnSale] = useState<"all" | "yes" | "no">("all");

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
      data={(result?.items ?? []).filter((p) => onSale === "all" || p.isActive === (onSale === "yes"))}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      loadingText="Loading packages..."
      emptyText={search ? "No packages match your search." : "No packages yet. Add your first treatment, e.g. Thai massage 90 min."}
      error={error ? { message: apiErrorMessage(error, "Failed to load packages."), onRetry: () => refetch() } : undefined}
      topContent={
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search packages..."
            className="sm:w-[300px]"
          />
          <Select value={onSale} onValueChange={(value) => setOnSale(value as typeof onSale)}>
            <SelectTrigger className="sm:w-[180px]">
              <SelectValue placeholder="On sale" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All packages</SelectItem>
              <SelectItem value="yes">On sale</SelectItem>
              <SelectItem value="no">Not on sale</SelectItem>
            </SelectContent>
          </Select>
        </div>
      }
      enableGridView
      showViewModeToggle
      defaultViewMode="grid"
      gridClassName="grid-cols-1 justify-items-start gap-3 sm:grid-cols-2 xl:grid-cols-4"
      gridCardClassName="w-full max-w-[240px] rounded-xl border border-border bg-background/90 p-0 shadow-sm"
      gridContentClassName="pr-0"
      renderGridItem={(p) => (
        <article className={cn("flex h-full flex-col p-3", !p.isActive && "opacity-60")}>
          <p className="text-[10px] uppercase tracking-[0.16em] text-muted">{p.durationMinutes} min</p>
          <button
            type="button"
            className="mt-1 line-clamp-2 text-left text-[13px] font-semibold leading-snug hover:text-mint"
            onClick={() => router.push(`/spa-packages/${p.id}/edit`)}
          >
            {p.name}
          </button>
          {p.items.length ? (
            <p className="mt-1 line-clamp-2 text-xs text-muted">
              + {p.items.map((i) => `${i.quantity} × ${i.name}`).join(", ")}
            </p>
          ) : null}
          <p className="mt-2 text-sm font-semibold">{formatPrice(p.price)}</p>
          <span
            className={`mt-auto inline-flex w-fit rounded-full px-2 py-0.5 text-xs font-medium ${
              p.isActive ? "bg-emerald-100 text-emerald-800" : "bg-muted text-muted-foreground"
            }`}
          >
            {p.isActive ? "On sale" : "Not on sale"}
          </span>
        </article>
      )}
      onEdit={(p) => router.push(`/spa-packages/${p.id}/edit`)}
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
