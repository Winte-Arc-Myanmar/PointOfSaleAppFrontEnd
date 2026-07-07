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
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { useToast } from "@/presentation/providers/ToastProvider";
import { usePagination } from "@/presentation/hooks/usePagination";
import { useBundles, useDeleteBundle } from "@/presentation/hooks/useBundles";
import type { Bundle } from "@/core/domain/entities/Bundle";
import { CreateBundleForm } from "./CreateBundleForm";
import { getBundleRowActions } from "./bundle-row-actions";
import { getBundleTableColumns } from "./bundle-table-columns";

const CREATE_FORM_ID = "create-bundle-form";
const SEARCH_DEBOUNCE_MS = 300;
const PAGE_SIZE = 10;
const ALL = "__all__";

export function BundleList() {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const del = useDeleteBundle();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState(ALL);
  const pagination = usePagination({ pageSize: PAGE_SIZE });

  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [searchInput]);

  useEffect(() => {
    pagination.reset(1);
  }, [search, activeFilter, pagination.reset]);

  const { data: bundlesResult, isLoading, error, refetch } = useBundles({
    search: search || undefined,
    page: pagination.page,
    limit: PAGE_SIZE,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const bundles = bundlesResult?.items ?? [];
  const filteredBundles = useMemo(
    () =>
      activeFilter === ALL
        ? bundles
        : bundles.filter((b) => (activeFilter === "ACTIVE" ? b.isActive : !b.isActive)),
    [bundles, activeFilter],
  );

  const actions = useMemo(
    () =>
      getBundleRowActions({
        onView: (b) => router.push(`/bundles/${b.id}`),
        onEdit: (b) => router.push(`/bundles/${b.id}/edit`),
        onDelete: async (b) => {
          const ok = await confirm({
            title: "Delete bundle",
            description: `Delete "${b.name}"? This cannot be undone.`,
            confirmLabel: "Delete",
            variant: "destructive",
          });
          if (ok) {
            del.mutate(String(b.id), {
              onSuccess: () => toast.success("Bundle deleted."),
              onError: () => toast.error("Failed to delete bundle."),
            });
          }
        },
      }),
    [router, confirm, del, toast],
  );

  const columns = useMemo(
    () =>
      getBundleTableColumns({
        onView: (b) => router.push(`/bundles/${b.id}`),
      }),
    [router],
  );

  return (
    <EntityListWithCreateModal<Bundle>
      data={filteredBundles}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      loadingText="Loading bundles..."
      emptyText={search ? "No bundles match your search." : "No bundles yet."}
      error={
        error
          ? {
              message: "Failed to load bundles.",
              onRetry: () => refetch(),
            }
          : undefined
      }
      topContent={
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search bundles..."
          />
          <Select value={activeFilter} onValueChange={setActiveFilter}>
            <SelectTrigger className="sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All statuses</SelectItem>
              <SelectItem value="ACTIVE">Active only</SelectItem>
              <SelectItem value="INACTIVE">Inactive only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      }
      pageSize={PAGE_SIZE}
      currentPage={pagination.page}
      totalPages={bundlesResult?.totalPages ?? pagination.getTotalPages(bundlesResult?.total)}
      totalItems={bundlesResult?.total ?? 0}
      onPageChange={pagination.setPage}
      addLabel="New Bundle"
      createTitle="Create Bundle"
      createSubmitText="Create Bundle"
      createLoadingText="Creating..."
      createFormId={CREATE_FORM_ID}
      createMaxWidth="2xl"
      renderCreateForm={({ formId, onSuccess, onLoadingChange }) => (
        <CreateBundleForm
          formId={formId}
          onSuccess={onSuccess}
          onLoadingChange={onLoadingChange}
        />
      )}
    />
  );
}
