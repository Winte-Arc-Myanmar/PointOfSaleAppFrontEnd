"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTenants } from "@/presentation/hooks/useTenants";
import { useSystemAdminDeleteTenant } from "@/presentation/hooks/useSystemAdmin";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import { useInferredServerPagination } from "@/presentation/hooks/useInferredServerPagination";
import { getTenantRowActions } from "./tenant-row-actions";
import { getTenantTableColumns } from "./tenant-table-columns";
import { CreateTenantForm } from "./CreateTenantForm";
import type { Tenant } from "@/core/domain/entities/Tenant";

const CREATE_TENANT_FORM_ID = "create-tenant-form";
const PAGE_SIZE = 10;

export function TenantList() {
  const router = useRouter();
  const pagination = useInferredServerPagination({ pageSize: PAGE_SIZE });
  const { data: tenants = [], isLoading, error, refetch } = useTenants({
    page: pagination.page,
    limit: PAGE_SIZE,
  });
  const deleteTenant = useSystemAdminDeleteTenant();
  const toast = useToast();
  const confirm = useConfirm();

  useEffect(() => {
    pagination.observePageResult(tenants.length);
  }, [tenants.length, pagination]);

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

  const columns = useMemo(() => getTenantTableColumns(), []);

  return (
    <EntityListWithCreateModal<Tenant>
      data={tenants}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      loadingText="Loading tenants..."
      emptyText="No tenants yet."
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
