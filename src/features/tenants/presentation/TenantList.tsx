"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTenants } from "@/presentation/hooks/useTenants";
import { useSystemAdminDeleteTenant } from "@/presentation/hooks/useSystemAdmin";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useConfirm } from "@/presentation/hooks/useConfirm";
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
import { getTenantRowActions } from "./tenant-row-actions";
import { getTenantTableColumns } from "./tenant-table-columns";
import { CreateTenantForm } from "./CreateTenantForm";
import type { Tenant } from "@/core/domain/entities/Tenant";

const CREATE_TENANT_FORM_ID = "create-tenant-form";
const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

export function TenantList() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("__all__");
  const pagination = usePagination({ pageSize: PAGE_SIZE });
  const { data: tenantsResult, isLoading, error, refetch } = useTenants({
    page: pagination.page,
    limit: PAGE_SIZE,
  });
  const tenants = tenantsResult?.items ?? [];
  const deleteTenant = useSystemAdminDeleteTenant();
  const toast = useToast();
  const confirm = useConfirm();
  const filteredTenants = useMemo(() => {
    const q = search.trim().toLowerCase();
    const searched = !q
      ? tenants
      : tenants.filter((t) =>
      [
        t.name,
        t.legalName,
        t.domain,
        t.primaryContactEmail,
        t.primaryContactPhone,
        t.city,
        t.country,
        String(t.id),
      ]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );

    if (selectedStatus === "__all__") return searched;
    return searched.filter(
      (t) => (t.status?.trim().toUpperCase() || "__none__") === selectedStatus,
    );
  }, [tenants, search, selectedStatus]);

  const statusOptions = useMemo(() => {
    const statuses = new Set<string>();
    tenants.forEach((t) => {
      const v = (t.status ?? "").trim().toUpperCase();
      if (v) statuses.add(v);
    });
    return Array.from(statuses).sort((a, b) => a.localeCompare(b));
  }, [tenants]);

  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [searchInput]);

  useEffect(() => {
    pagination.reset(1);
  }, [search, pagination.reset]);

  useEffect(() => {
    pagination.reset(1);
  }, [selectedStatus, pagination.reset]);

  const actions = useMemo(
    () =>
      getTenantRowActions({
        onView: (t) => router.push(`/tenants/${t.id}`),
        onEdit: (t) => router.push(`/tenants/${t.id}/edit`),
        onDelete: async (t) => {
          const ok = await confirm({
            title: "Delete tenant",
            description: `Delete "${t.name}"? This cannot be undone.`,
            confirmLabel: "Delete",
            variant: "destructive",
          });
          if (ok) {
            deleteTenant.mutate(t.id, {
              onSuccess: () => toast.success("Tenant deleted."),
              onError: () => toast.error("Failed to delete tenant."),
            });
          }
        },
      }),
    [router, deleteTenant, toast, confirm]
  );

  const columns = useMemo(
    () =>
      getTenantTableColumns({
        onView: (t) => router.push(`/tenants/${t.id}`),
      }),
    [router],
  );

  async function handleDeleteSelected(items: Tenant[]) {
    if (items.length === 0) return;
    const ok = await confirm({
      title: "Delete tenants",
      description: `Delete ${items.length} selected tenant(s)? This cannot be undone.`,
      confirmLabel: "Delete",
      variant: "destructive",
    });
    if (!ok) return;
    try {
      for (const item of items) {
        await deleteTenant.mutateAsync(item.id);
      }
      toast.success(`${items.length} tenant(s) deleted.`);
    } catch {
      toast.error("Failed to delete some tenants.");
    }
  }

  return (
    <EntityListWithCreateModal<Tenant>
      data={filteredTenants}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      loadingText="Loading tenants..."
      emptyText={
        search.trim()
          ? "No tenants match your search."
          : selectedStatus !== "__all__"
            ? "No tenants match this status."
            : "No tenants yet."
      }
      topContent={
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search tenants..."
            className="sm:w-[360px]"
          />
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="sm:w-[220px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All statuses</SelectItem>
              {statusOptions.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      }
      error={
        error
          ? {
              message: "Failed to load tenants. Is the backend API running?",
              onRetry: () => refetch(),
            }
          : undefined
      }
      pageSize={PAGE_SIZE}
      currentPage={pagination.page}
      totalPages={pagination.getTotalPages(tenantsResult?.total)}
      totalItems={tenantsResult?.total ?? 0}
      onPageChange={pagination.setPage}
      addLabel="Add Tenant"
      createTitle="Create Tenant"
      createSubmitText="Create Tenant"
      createLoadingText="Creating..."
      createFormId={CREATE_TENANT_FORM_ID}
      createMaxWidth="2xl"
      enableRowSelection
      onEditSelected={(item) => router.push(`/tenants/${item.id}/edit`)}
      onDeleteSelected={handleDeleteSelected}
      renderCreateForm={({ formId, onSuccess, onLoadingChange }) => (
        <CreateTenantForm
          formId={formId}
          onSuccess={onSuccess}
          onLoadingChange={onLoadingChange}
        />
      )}
    />
  );
}
