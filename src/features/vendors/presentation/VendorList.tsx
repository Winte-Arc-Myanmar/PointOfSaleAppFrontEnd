"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { useToast } from "@/presentation/providers/ToastProvider";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import { useDeleteVendor, useVendors } from "@/presentation/hooks/useVendors";
import { useInferredServerPagination } from "@/presentation/hooks/useInferredServerPagination";
import type { Vendor } from "@/core/domain/entities/Vendor";
import { CreateVendorForm } from "./CreateVendorForm";
import { getVendorRowActions } from "./vendor-row-actions";
import { getVendorTableColumns } from "./vendor-table-columns";

const CREATE_VENDOR_FORM_ID = "create-vendor-form";
const PAGE_SIZE = 10;

export function VendorList() {
  const router = useRouter();
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

  useEffect(() => {
    pagination.observePageResult(vendors.length);
  }, [vendors.length, pagination]);

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

  const columns = useMemo(() => getVendorTableColumns(), []);

  return (
    <EntityListWithCreateModal<Vendor>
      data={vendors}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      loadingText="Loading vendors..."
      emptyText="No vendors yet."
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
