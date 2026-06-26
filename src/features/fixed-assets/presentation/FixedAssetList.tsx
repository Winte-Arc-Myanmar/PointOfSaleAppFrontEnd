"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/presentation/components/ui/input";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { useToast } from "@/presentation/providers/ToastProvider";
import { usePagination } from "@/presentation/hooks/usePagination";
import { useFixedAssets, useDeleteFixedAsset } from "@/presentation/hooks/useFixedAssets";
import type { FixedAsset } from "@/core/domain/entities/FixedAsset";
import { CreateFixedAssetForm } from "./CreateFixedAssetForm";
import { getFixedAssetRowActions } from "./fixed-asset-row-actions";
import { getFixedAssetTableColumns } from "./fixed-asset-table-columns";

const CREATE_FORM_ID = "create-fixed-asset-form";
const SEARCH_DEBOUNCE_MS = 300;
const PAGE_SIZE = 10;

export function FixedAssetList() {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const del = useDeleteFixedAsset();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const pagination = usePagination({ pageSize: PAGE_SIZE });

  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [searchInput]);

  const { data: assetsResult, isLoading, error, refetch } = useFixedAssets({
    search: search || undefined,
    page: pagination.page,
    limit: PAGE_SIZE,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const assets = assetsResult?.items ?? [];

  useEffect(() => {
    pagination.reset(1);
  }, [search, pagination.reset]);

  const actions = useMemo(
    () =>
      getFixedAssetRowActions({
        onView: (a) => router.push(`/fixed-assets/${a.id}`),
        onEdit: (a) => router.push(`/fixed-assets/${a.id}/edit`),
        onDelete: async (a) => {
          const ok = await confirm({
            title: "Delete fixed asset",
            description: `Delete "${a.assetName}"? This cannot be undone.`,
            confirmLabel: "Delete",
            variant: "destructive",
          });
          if (ok) {
            del.mutate(String(a.id), {
              onSuccess: () => toast.success("Fixed asset deleted."),
              onError: () => toast.error("Failed to delete fixed asset."),
            });
          }
        },
      }),
    [router, confirm, del, toast]
  );

  const columns = useMemo(
    () =>
      getFixedAssetTableColumns({
        onView: (a) => router.push(`/fixed-assets/${a.id}`),
      }),
    [router]
  );

  return (
    <EntityListWithCreateModal<FixedAsset>
      data={assets}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      loadingText="Loading fixed assets..."
      emptyText={search ? "No fixed assets match your search." : "No fixed assets yet."}
      error={
        error
          ? {
              message: "Failed to load fixed assets.",
              onRetry: () => refetch(),
            }
          : undefined
      }
      topContent={
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search fixed assets..."
          />
        </div>
      }
      pageSize={PAGE_SIZE}
      currentPage={pagination.page}
      totalPages={assetsResult?.totalPages ?? pagination.getTotalPages(assetsResult?.total)}
      totalItems={assetsResult?.total ?? 0}
      onPageChange={pagination.setPage}
      addLabel="New Asset"
      createTitle="Create Fixed Asset"
      createSubmitText="Create Asset"
      createLoadingText="Creating..."
      createFormId={CREATE_FORM_ID}
      createMaxWidth="2xl"
      renderCreateForm={({ formId, onSuccess, onLoadingChange }) => (
        <CreateFixedAssetForm
          formId={formId}
          onSuccess={onSuccess}
          onLoadingChange={onLoadingChange}
        />
      )}
    />
  );
}
