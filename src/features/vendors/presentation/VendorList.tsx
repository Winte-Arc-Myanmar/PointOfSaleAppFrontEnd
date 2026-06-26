"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { useToast } from "@/presentation/providers/ToastProvider";
import { Input } from "@/presentation/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import { useDeleteVendor, useVendors } from "@/presentation/hooks/useVendors";
import { usePagination } from "@/presentation/hooks/usePagination";
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
  const [selectedTenantId, setSelectedTenantId] = useState("__all__");
  const pagination = usePagination({ pageSize: PAGE_SIZE });
  const {
    data: vendorsResult,
    isLoading,
    error,
    refetch,
  } = useVendors({ page: pagination.page, limit: PAGE_SIZE });
  const vendors = vendorsResult?.items ?? [];
  const deleteVendor = useDeleteVendor();
  const toast = useToast();
  const confirm = useConfirm();
  const filteredVendors = useMemo(() => {
    const q = search.trim().toLowerCase();
    const searched = !q
      ? vendors
      : vendors.filter((v) =>
      [v.name, v.tenantId, String(v.id)].join(" ").toLowerCase().includes(q),
    );
    if (selectedTenantId === "__all__") return searched;
    return searched.filter((v) => v.tenantId === selectedTenantId);
  }, [vendors, search, selectedTenantId]);

  const tenantOptions = useMemo(() => {
    const ids = new Set(vendors.map((v) => v.tenantId).filter(Boolean));
    return Array.from(ids).sort((a, b) => a.localeCompare(b));
  }, [vendors]);

  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [searchInput]);

  useEffect(() => {
    pagination.reset(1);
  }, [search, pagination.reset]);

  useEffect(() => {
    pagination.reset(1);
  }, [selectedTenantId, pagination.reset]);

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

  async function handleDeleteSelected(items: Vendor[]) {
    if (items.length === 0) return;
    const ok = await confirm({
      title: "Delete vendors",
      description: `Delete ${items.length} selected vendor(s)? This cannot be undone.`,
      confirmLabel: "Delete",
      variant: "destructive",
    });
    if (!ok) return;
    try {
      for (const item of items) {
        await deleteVendor.mutateAsync(String(item.id));
      }
      toast.success(`${items.length} vendor(s) deleted.`);
    } catch {
      toast.error("Failed to delete some vendors.");
    }
  }

  return (
    <EntityListWithCreateModal<Vendor>
      data={filteredVendors}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      loadingText="Loading vendors..."
      emptyText={
        search.trim()
          ? "No vendors match your search."
          : selectedTenantId !== "__all__"
            ? "No vendors match this tenant."
            : "No vendors yet."
      }
      topContent={
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search vendors..."
            className="sm:w-[360px]"
          />
          <Select value={selectedTenantId} onValueChange={setSelectedTenantId}>
            <SelectTrigger className="sm:w-[240px]">
              <SelectValue placeholder="Filter by tenant" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All tenants</SelectItem>
              {tenantOptions.map((tenantId) => (
                <SelectItem key={tenantId} value={tenantId}>
                  {tenantId}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
      pageSize={PAGE_SIZE}
      currentPage={pagination.page}
      totalPages={vendorsResult?.totalPages ?? pagination.getTotalPages(vendorsResult?.total)}
      totalItems={vendorsResult?.total ?? 0}
      onPageChange={pagination.setPage}
      addLabel="Add Vendor"
      createTitle="Create Vendor"
      createSubmitText="Create Vendor"
      createLoadingText="Creating..."
      createFormId={CREATE_VENDOR_FORM_ID}
      createMaxWidth="md"
      enableRowSelection
      onEditSelected={(item) => router.push(`/vendors/${item.id}/edit`)}
      onDeleteSelected={handleDeleteSelected}
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
