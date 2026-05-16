"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { useToast } from "@/presentation/providers/ToastProvider";
import { Input } from "@/presentation/components/ui/input";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import { useDeleteVendor, useVendors } from "@/presentation/hooks/useVendors";
import { useInferredServerPagination } from "@/presentation/hooks/useInferredServerPagination";
import type { Vendor } from "@/core/domain/entities/Vendor";
import { CreateVendorForm } from "./CreateVendorForm";
import { getVendorRowActions } from "./vendor-row-actions";
import { getVendorTableColumns } from "./vendor-table-columns";

const CREATE_VENDOR_FORM_ID = "create-vendor-form";
const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

export function VendorList() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const pagination = useInferredServerPagination({ pageSize: PAGE_SIZE });
  const {
    data: vendors = [],
    isLoading,
    error,
    refetch,
  } = useVendors({ page: pagination.page, limit: PAGE_SIZE });
  const deleteVendor = useDeleteVendor();
  const toast = useToast();
  const confirm = useConfirm();
  const filteredVendors = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return vendors;
    return vendors.filter((v) =>
      [v.name, v.tenantId, String(v.id)].join(" ").toLowerCase().includes(q),
    );
  }, [vendors, search]);

  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [searchInput]);

  useEffect(() => {
    pagination.observePageResult(filteredVendors.length);
  }, [filteredVendors.length, pagination]);

  useEffect(() => {
    pagination.reset(1);
  }, [search, pagination]);

  const actions = useMemo(
    () =>
      getVendorRowActions({
        onView: (v) => router.push(`/vendors/${v.id}`),
        onEdit: (v) => router.push(`/vendors/${v.id}/edit`),
        onDelete: async (v) => {
          const ok = await confirm({
            title: "Delete vendor",
            description: `Delete "${v.name}"? This cannot be undone.`,
            confirmLabel: "Delete",
            variant: "destructive",
          });
          if (ok) {
            deleteVendor.mutate(String(v.id), {
              onSuccess: () => toast.success("Vendor deleted."),
              onError: () => toast.error("Failed to delete vendor."),
            });
          }
        },
      }),
    [router, deleteVendor, toast, confirm]
  );

  const columns = useMemo(
    () =>
      getVendorTableColumns({
        onView: (v) => router.push(`/vendors/${v.id}`),
      }),
    [router],
  );

  return (
    <EntityListWithCreateModal<Vendor>
      data={filteredVendors}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      loadingText="Loading vendors..."
      emptyText={search.trim() ? "No vendors match your search." : "No vendors yet."}
      topContent={
        <div className="mb-4">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search vendors..."
            className="sm:w-[360px]"
          />
        </div>
      }
      error={
        error
          ? {
              message: "Failed to load vendors.",
              onRetry: () => refetch(),
            }
          : undefined
      }
      pageSize={10}
      currentPage={pagination.page}
      totalPages={pagination.totalPages}
      totalItems={pagination.totalItems}
      onPageChange={(p) => pagination.setPage(p)}
      addLabel="Add Vendor"
      createTitle="Create Vendor"
      createSubmitText="Create Vendor"
      createLoadingText="Creating..."
      createFormId={CREATE_VENDOR_FORM_ID}
      createMaxWidth="md"
      renderCreateForm={({ formId, onSuccess, onLoadingChange }) => (
        <CreateVendorForm
          formId={formId}
          onSuccess={onSuccess}
          onLoadingChange={onLoadingChange}
        />
      )}
    />
  );
}
