"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useTenants, useDeleteTenant } from "@/presentation/hooks/useTenants";
import { Button } from "@/presentation/components/ui/button";
import { DataTable } from "@/presentation/components/data-table";
import { FormModal } from "@/presentation/components/modal/FormModal";
import { getTenantRowActions } from "./tenant-row-actions";
import { getTenantTableColumns } from "./tenant-table-columns";
import { CreateTenantForm } from "./CreateTenantForm";
import type { Tenant } from "@/core/domain/entities/Tenant";

const CREATE_TENANT_FORM_ID = "create-tenant-form";

export function TenantList() {
  const router = useRouter();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createFormLoading, setCreateFormLoading] = useState(false);
  const { data: tenants = [], isLoading, error, refetch } = useTenants();
  const deleteTenant = useDeleteTenant();

  const actions = useMemo(
    () =>
      getTenantRowActions({
        onView: (t) => router.push(`/admin/tenants/${t.id}`),
        onEdit: (t) => router.push(`/admin/tenants/${t.id}/edit`),
        onDelete: (t) => {
          if (
            typeof window !== "undefined" &&
            window.confirm(`Delete tenant "${t.name}"? This cannot be undone.`)
          ) {
            deleteTenant.mutate(t.id);
          }
        },
      }),
    [router, deleteTenant]
  );

  const columns = useMemo(() => getTenantTableColumns(), []);

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Tenant
        </Button>
      </div>
      <DataTable<Tenant>
        data={tenants}
        columns={columns}
        actions={actions}
        isLoading={isLoading}
        loadingText="Loading tenants..."
        emptyText="No tenants yet."
        emptyAction={{
          label: "Add Tenant",
          onClick: () => setCreateModalOpen(true),
        }}
        error={
          error
            ? {
                message: "Failed to load tenants. Is the backend API running?",
                onRetry: () => refetch(),
              }
            : undefined
        }
        pageSize={10}
      />
      <FormModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Tenant"
        formId={CREATE_TENANT_FORM_ID}
        formContent={
          <CreateTenantForm
            formId={CREATE_TENANT_FORM_ID}
            onSuccess={() => setCreateModalOpen(false)}
            onLoadingChange={setCreateFormLoading}
          />
        }
        submitText="Create Tenant"
        loadingText="Creating..."
        isLoading={createFormLoading}
        maxWidth="2xl"
      />
    </>
  );
}
