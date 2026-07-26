"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/presentation/components/ui/input";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { useToast } from "@/presentation/providers/ToastProvider";
import { usePagination } from "@/presentation/hooks/usePagination";
import {
  useVendorInvoices,
  useDeleteVendorInvoice,
} from "@/presentation/hooks/useVendorInvoices";
import type { VendorInvoice } from "@/core/domain/entities/VendorInvoice";
import { CreateVendorInvoiceForm } from "./CreateVendorInvoiceForm";
import { getVendorInvoiceRowActions } from "./vendor-invoice-row-actions";
import { getVendorInvoiceTableColumns } from "./vendor-invoice-table-columns";

const CREATE_FORM_ID = "create-vendor-invoice-form";
const SEARCH_DEBOUNCE_MS = 300;
const PAGE_SIZE = 10;

export function VendorInvoiceList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultGrnId = searchParams.get("grnId") ?? undefined;
  const defaultPurchaseOrderId = searchParams.get("purchaseOrderId") ?? undefined;
  const toast = useToast();
  const confirm = useConfirm();
  const del = useDeleteVendorInvoice();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const pagination = usePagination({ pageSize: PAGE_SIZE });

  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [searchInput]);

  const { data: result, isLoading, error, refetch } = useVendorInvoices({
    search: search || undefined,
    page: pagination.page,
    limit: PAGE_SIZE,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const items = result?.items ?? [];

  useEffect(() => {
    pagination.reset(1);
  }, [search, pagination.reset]);

  const actions = useMemo(
    () =>
      getVendorInvoiceRowActions({
        onView: (row) => router.push(`/vendor-invoices/${row.id}`),
        onEdit: (row) => router.push(`/vendor-invoices/${row.id}/edit`),
        onDelete: async (row) => {
          const ok = await confirm({
            title: "Delete vendor invoice",
            description: `Delete invoice ${row.invoiceNumber}? This cannot be undone.`,
            confirmLabel: "Delete",
            variant: "destructive",
          });
          if (ok) {
            del.mutate(String(row.id), {
              onSuccess: () => toast.success("Vendor invoice deleted."),
              onError: () => toast.error("Failed to delete vendor invoice."),
            });
          }
        },
      }),
    [router, confirm, del, toast]
  );

  const columns = useMemo(
    () =>
      getVendorInvoiceTableColumns({
        onView: (row) => router.push(`/vendor-invoices/${row.id}`),
      }),
    [router],
  );

  return (
    <EntityListWithCreateModal<VendorInvoice>
      data={items}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      loadingText="Loading vendor invoices..."
      emptyText={search ? "No vendor invoices match your search." : "No vendor invoices yet."}
      error={
        error
          ? {
              message: "Failed to load vendor invoices.",
              onRetry: () => refetch(),
            }
          : undefined
      }
      topContent={
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search vendor invoices..."
          />
        </div>
      }
      pageSize={PAGE_SIZE}
      currentPage={pagination.page}
      totalPages={result?.totalPages ?? pagination.getTotalPages(result?.total)}
      totalItems={result?.total ?? 0}
      onPageChange={pagination.setPage}
      addLabel="New Vendor Invoice"
      createTitle="Create Vendor Invoice"
      createSubmitText="Create Vendor Invoice"
      createLoadingText="Creating..."
      createFormId={CREATE_FORM_ID}
      createMaxWidth="2xl"
      renderCreateForm={({ formId, onSuccess, onLoadingChange }) => (
        <CreateVendorInvoiceForm
          formId={formId}
          onSuccess={onSuccess}
          onLoadingChange={onLoadingChange}
          defaultGrnId={defaultGrnId}
          defaultPurchaseOrderId={defaultPurchaseOrderId}
        />
      )}
    />
  );
}
