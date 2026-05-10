"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTenants } from "@/presentation/hooks/useTenants";
import { useSystemAdminDeleteTenant } from "@/presentation/hooks/useSystemAdmin";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { Input } from "@/presentation/components/ui/input";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import { useInferredServerPagination } from "@/presentation/hooks/useInferredServerPagination";
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
  const pagination = useInferredServerPagination({ pageSize: PAGE_SIZE });
  const { data: tenants = [], isLoading, error, refetch } = useTenants({
    page: pagination.page,
    limit: PAGE_SIZE,
  });
  const deleteTenant = useSystemAdminDeleteTenant();
  const toast = useToast();
  const confirm = useConfirm();
  const filteredTenants = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tenants;
    return tenants.filter((t) =>
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
  }, [tenants, search]);

  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [searchInput]);

  useEffect(() => {
    pagination.observePageResult(filteredTenants.length);
  }, [filteredTenants.length, pagination]);

  useEffect(() => {
    pagination.reset(1);
  }, [search, pagination]);

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

  return (
    <EntityListWithCreateModal<Tenant>
      data={filteredTenants}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      loadingText="Loading tenants..."
      emptyText={search.trim() ? "No tenants match your search." : "No tenants yet."}
      topContent={
        <div className="mb-4">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search tenants..."
            className="sm:w-[360px]"
          />
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
      pageSize={10}
      currentPage={pagination.page}
      totalPages={pagination.totalPages}
      totalItems={pagination.totalItems}
      onPageChange={(p) => pagination.setPage(p)}
      addLabel="Add Tenant"
      createTitle="Create Tenant"
      createSubmitText="Create Tenant"
      createLoadingText="Creating..."
      createFormId={CREATE_TENANT_FORM_ID}
      createMaxWidth="2xl"
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
