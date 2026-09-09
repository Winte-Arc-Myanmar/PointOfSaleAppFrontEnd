"use client";

import { useEffect, useMemo, useState } from "react";
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
import { FormModal } from "@/presentation/components/modal/FormModal";
import { usePagination } from "@/presentation/hooks/usePagination";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { useCurrency } from "@/presentation/providers/CurrencyProvider";
import { useToast } from "@/presentation/providers/ToastProvider";
import { MembershipCardCategoryTree } from "./MembershipCardCategoryTree";
import { getMembershipCardTemplateTableColumns } from "./membership-card-template-table-columns";
import { CreateMembershipCardTemplateForm } from "./CreateMembershipCardTemplateForm";
import { CreateMembershipCardCategoryForm } from "./CreateMembershipCardCategoryForm";
import { useMembershipCardTemplates, useDeleteMembershipCardTemplate } from "@/presentation/hooks/useMembershipCardTemplates";
import type { MembershipCardTemplate } from "@/core/domain/entities/MembershipCardTemplate";
import type { MembershipCardCategory } from "@/core/domain/entities/MembershipCardCategory";

const PAGE_SIZE = 8;
const CREATE_FORM_ID = "create-membership-card-template-form";

type TierFilter = "all" | "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";

function getTierLabel(value: TierFilter) {
  if (value === "all") return "All tiers";
  return value;
}

export function MembershipCardTemplateList() {
  const pagination = usePagination({ pageSize: PAGE_SIZE });
  const toast = useToast();
  const confirm = useConfirm();
  const { formatPrice } = useCurrency();
  const deleteTemplate = useDeleteMembershipCardTemplate();

  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<TierFilter>("all");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedTreeCategory, setSelectedTreeCategory] =
    useState<MembershipCardCategory | null>(null);
  const [createCategoryOpen, setCreateCategoryOpen] = useState(false);
  const [createCategoryLoading, setCreateCategoryLoading] = useState(false);

  const { data: result, isLoading, error, refetch } = useMembershipCardTemplates({
    page: pagination.page,
    limit: PAGE_SIZE,
    search: searchQuery.trim() || undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const templates = result?.items ?? [];
  const usingDemoData = templates.some((item) =>
    String(item.id).startsWith("mct-"),
  );

  const filteredTemplates = useMemo(() => {
    return templates.filter((item) => {
      const tierOk = tierFilter === "all" || item.tier === tierFilter;
      const categoryOk = selectedCategoryId
        ? String(item.categoryId) === String(selectedCategoryId)
        : true;
      return tierOk && categoryOk;
    });
  }, [templates, tierFilter, selectedCategoryId]);

  useEffect(() => {
    pagination.reset(1);
  }, [searchQuery, tierFilter, selectedCategoryId, pagination.reset]);

  async function handleDelete(template: MembershipCardTemplate) {
    const ok = await confirm({
      title: "Delete card template",
      description: `Delete "${template.name}"? This cannot be undone.`,
      confirmLabel: "Delete",
      variant: "destructive",
    });
    if (!ok) return;
    deleteTemplate.mutate(String(template.id), {
      onSuccess: () => toast.success("Membership card template deleted."),
      onError: () => toast.error("Failed to delete membership card template."),
    });
  }

  const hasActiveFilters =
    searchQuery.trim().length > 0 || tierFilter !== "all" || selectedCategoryId !== null;

  const columns = useMemo(
    () =>
      getMembershipCardTemplateTableColumns({
        formatPrice,
        onDelete: (t) => void handleDelete(t),
      }),
    [formatPrice],
  );

  return (
    <>
      <EntityListWithCreateModal<MembershipCardTemplate>
      data={filteredTemplates}
      columns={columns}
      actions={[]}
      isLoading={isLoading}
      loadingText="Loading membership card templates..."
      emptyText="No card templates match your current filters."
      error={
        error
          ? { message: "Failed to load membership card templates.", onRetry: () => refetch() }
          : undefined
      }
      pageSize={PAGE_SIZE}
      currentPage={pagination.page}
      totalPages={result?.totalPages ?? pagination.getTotalPages(result?.total)}
      totalItems={result?.total ?? 0}
      onPageChange={pagination.setPage}
      showActionBar={false}
      addLabel="Add Card Template"
      createTitle="Add Membership Card Template"
      createSubmitText="Create Template"
      createLoadingText="Creating..."
      createFormId={CREATE_FORM_ID}
      createMaxWidth="2xl"
      renderCreateForm={({ formId, onSuccess, onLoadingChange }) => (
        <CreateMembershipCardTemplateForm
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
              Card Templates
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-muted">
              Manage card categories and card details (tier, amount, and rules).
            </p>
            {usingDemoData ? (
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Showing demo data until membership APIs return live records.
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-border bg-background/80 px-4 py-2 text-sm text-muted">
              {filteredTemplates.length} templates
              {usingDemoData ? " · demo" : ""}
            </div>
            <Button
              type="button"
              onClick={openCreate}
              className="h-11 rounded-xl bg-mint px-5 text-gloss-black hover:bg-mint-hover"
            >
              <Plus className="size-4" />
              Add Card Template
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreateCategoryOpen(true)}
              className="h-11 rounded-xl px-5"
            >
              Add Card Category
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
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search card templates by name"
              className="h-11 pl-10"
            />
          </label>
          <div className="min-w-[220px]">
            <Select value={tierFilter} onValueChange={(value) => setTierFilter(value as TierFilter)}>
              <SelectTrigger className="h-11 rounded-xl border-border bg-background text-foreground">
                <div className="flex items-center gap-3">
                  <Filter className="size-4 text-muted" />
                  <SelectValue placeholder="All tiers" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All tiers</SelectItem>
                <SelectItem value="BRONZE">Bronze</SelectItem>
                <SelectItem value="SILVER">Silver</SelectItem>
                <SelectItem value="GOLD">Gold</SelectItem>
                <SelectItem value="PLATINUM">Platinum</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setTierFilter("all");
                setSelectedCategoryId(null);
                setSelectedTreeCategory(null);
              }}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-medium text-foreground transition hover:bg-mint/10"
            >
              <X className="size-4" />
              Clear filters
            </button>
          ) : null}
        </div>
      }
      sidebarContent={
        <MembershipCardCategoryTree
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={(categoryId, category) => {
            setSelectedCategoryId(categoryId);
            setSelectedTreeCategory(category ?? null);
          }}
        />
      }
      tablePanelClassName="rounded-2xl border border-border bg-background/80 shadow-sm"
      tableContentClassName="px-5 pb-5"
      tablePanelHeader={
        <div className="flex flex-col gap-3 border-b border-border px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Card Details</h2>
            <p className="mt-1 text-sm text-muted">
              Tier filter: {getTierLabel(tierFilter)}
              {selectedTreeCategory ? ` • Category: ${selectedTreeCategory.name}` : ""}
            </p>
          </div>
        </div>
      }
      />
      <FormModal
        isOpen={createCategoryOpen}
        onClose={() => setCreateCategoryOpen(false)}
        title="Add Card Category"
        formId="create-membership-card-category-form"
        formContent={
          <CreateMembershipCardCategoryForm
            formId="create-membership-card-category-form"
            onSuccess={() => setCreateCategoryOpen(false)}
            onLoadingChange={setCreateCategoryLoading}
          />
        }
        submitText="Create Category"
        loadingText="Creating..."
        isLoading={createCategoryLoading}
        maxWidth="xl"
      />
    </>
  );
}
