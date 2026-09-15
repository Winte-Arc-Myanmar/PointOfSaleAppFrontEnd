"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Filter, Plus, Search, X } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import { usePagination } from "@/presentation/hooks/usePagination";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { useCurrency } from "@/presentation/providers/CurrencyProvider";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useCardTiers, useDeleteCardTier } from "@/presentation/hooks/useCardTiers";
import type { CardTier } from "@/core/domain/entities/CardTier";
import { getCardTierTableColumns } from "./card-tier-table-columns";
import { getCardTierRowActions } from "./card-tier-row-actions";
import { CreateCardTierForm } from "./CreateCardTierForm";
import { getHttpErrorMessage } from "@/lib/http-error";

const PAGE_SIZE = 10;
const CREATE_FORM_ID = "create-card-tier-form";
const SEARCH_DEBOUNCE_MS = 300;
const LIST_HREF = "/card-tiers";

type StatusFilter = "all" | "active" | "inactive";
type BillingFilter = "all" | "prepaid" | "postpaid";

export function CardTierList() {
  const router = useRouter();
  const pagination = usePagination({ pageSize: PAGE_SIZE });
  const toast = useToast();
  const confirm = useConfirm();
  const { formatPrice } = useCurrency();
  const del = useDeleteCardTier();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [billingFilter, setBillingFilter] = useState<BillingFilter>("all");

  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [searchInput]);

  const { data: result, isLoading, error, refetch } = useCardTiers({
    page: pagination.page,
    limit: PAGE_SIZE,
    search: search || undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const tiers = result?.items ?? [];

  const filteredTiers = useMemo(
    () =>
      tiers.filter((tier) => {
        const statusOk =
          statusFilter === "all" ||
          (statusFilter === "active" ? tier.isActive : !tier.isActive);
        const billingOk =
          billingFilter === "all" ||
          (billingFilter === "postpaid" ? tier.isPostpaid : !tier.isPostpaid);
        return statusOk && billingOk;
      }),
    [tiers, statusFilter, billingFilter],
  );

  useEffect(() => {
    pagination.reset(1);
  }, [search, statusFilter, billingFilter, pagination.reset]);

  const hasActiveFilters =
    search.length > 0 || statusFilter !== "all" || billingFilter !== "all";

  const actions = useMemo(
    () =>
      getCardTierRowActions({
        onView: (row) => router.push(`${LIST_HREF}/${row.id}`),
        onEdit: (row) => router.push(`${LIST_HREF}/${row.id}/edit`),
        onDelete: async (row) => {
          const ok = await confirm({
            title: "Retire card tier",
            description: `Retire "${row.name}"? Cards already issued against it keep working.`,
            confirmLabel: "Retire",
            variant: "destructive",
          });
          if (!ok) return;
          del.mutate(String(row.id), {
            onSuccess: () => toast.success("Card tier retired."),
            onError: (err) =>
              toast.error(getHttpErrorMessage(err, "Failed to retire card tier.")),
          });
        },
      }),
    [router, confirm, del, toast],
  );

  const columns = useMemo(
    () =>
      getCardTierTableColumns({
        formatPrice,
        onView: (row) => router.push(`${LIST_HREF}/${row.id}`),
      }),
    [formatPrice, router],
  );

  return (
    <EntityListWithCreateModal<CardTier>
      data={filteredTiers}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      loadingText="Loading card tiers..."
      emptyText="No card tiers match your current filters."
      error={
        error
          ? {
              message: getHttpErrorMessage(error, "Failed to load card tiers."),
              onRetry: () => refetch(),
            }
          : undefined
      }
      pageSize={PAGE_SIZE}
      currentPage={pagination.page}
      totalPages={result?.totalPages ?? pagination.getTotalPages(result?.total)}
      totalItems={result?.total ?? 0}
      onPageChange={pagination.setPage}
      showActionBar={false}
      addLabel="Add Card Tier"
      createTitle="Create Card Tier"
      createSubmitText="Create Tier"
      createLoadingText="Creating..."
      createFormId={CREATE_FORM_ID}
      createMaxWidth="2xl"
      renderCreateForm={({ formId, onSuccess, onLoadingChange }) => (
        <CreateCardTierForm
          formId={formId}
          onSuccess={onSuccess}
          onLoadingChange={onLoadingChange}
        />
      )}
      rootClassName="rounded-[28px] border border-border bg-background/70 p-5 shadow-sm sm:p-8"
      renderPageHeader={({ openCreate }) => (
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-muted">
              Membership Payment
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Card Tiers
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-muted">
              Define hotel card tiers: rank, preload amount, funding, discount, validity, and
              postpaid rules. Changes apply to new cards only.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-border bg-background/80 px-4 py-2 text-sm text-muted">
              {filteredTiers.length} tiers
            </div>
            <Button
              type="button"
              onClick={openCreate}
              className="h-11 rounded-xl bg-mint px-5 text-gloss-black hover:bg-mint-hover"
            >
              <Plus className="size-4" />
              Add Card Tier
            </Button>
          </div>
        </div>
      )}
      topContent={
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-border bg-background/80 p-4 shadow-sm md:flex-row md:items-center">
          <label className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <Input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search card tiers by name"
              className="h-11 pl-10"
            />
          </label>
          <div className="min-w-[180px]">
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as StatusFilter)}
            >
              <SelectTrigger className="h-11 rounded-xl border-border bg-background text-foreground">
                <div className="flex items-center gap-3">
                  <Filter className="size-4 text-muted" />
                  <SelectValue placeholder="All statuses" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="min-w-[180px]">
            <Select
              value={billingFilter}
              onValueChange={(value) => setBillingFilter(value as BillingFilter)}
            >
              <SelectTrigger className="h-11 rounded-xl border-border bg-background text-foreground">
                <SelectValue placeholder="All billing" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All billing</SelectItem>
                <SelectItem value="prepaid">Prepaid</SelectItem>
                <SelectItem value="postpaid">Postpaid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                setSearch("");
                setStatusFilter("all");
                setBillingFilter("all");
              }}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-medium text-foreground transition hover:bg-mint/10"
            >
              <X className="size-4" />
              Clear filters
            </button>
          ) : null}
        </div>
      }
      tablePanelClassName="rounded-2xl border border-border bg-background/80 shadow-sm"
      tableContentClassName="px-5 pb-5"
      tablePanelHeader={
        <div className="flex flex-col gap-3 border-b border-border px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Card details</h2>
            <p className="mt-1 text-sm text-muted">
              Rank, preload, funding, discount, validity, and status from card-tiers.
            </p>
          </div>
        </div>
      }
    />
  );
}
