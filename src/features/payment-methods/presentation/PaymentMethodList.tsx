"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/presentation/components/ui/input";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useInferredServerPagination } from "@/presentation/hooks/useInferredServerPagination";
import {
  useDeletePaymentMethod,
  usePaymentMethods,
} from "@/presentation/hooks/usePaymentMethods";
import type { PaymentMethod } from "@/core/domain/entities/PaymentMethod";
import { CreatePaymentMethodForm } from "./CreatePaymentMethodForm";
import { getPaymentMethodRowActions } from "./payment-method-row-actions";
import { getPaymentMethodTableColumns } from "./payment-method-table-columns";

const CREATE_FORM_ID = "create-payment-method-form";
const SEARCH_DEBOUNCE_MS = 300;
const PAGE_SIZE = 10;

export function PaymentMethodList() {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const del = useDeletePaymentMethod();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const pagination = useInferredServerPagination({ pageSize: PAGE_SIZE });

  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [searchInput]);

  const { data: methods = [], isLoading, error, refetch } = usePaymentMethods({
    search: search || undefined,
    page: pagination.page,
    limit: PAGE_SIZE,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  useEffect(() => {
    pagination.observePageResult(methods.length);
  }, [methods.length, pagination]);

  useEffect(() => {
    pagination.reset(1);
  }, [search, pagination]);

  const actions = useMemo(
    () =>
      getPaymentMethodRowActions({
        onView: (m) => router.push(`/payment-methods/${m.id}`),
        onEdit: (m) => router.push(`/payment-methods/${m.id}/edit`),
        onDelete: async (m) => {
          const ok = await confirm({
            title: "Delete payment method",
            description: `Delete "${m.name}"? This cannot be undone.`,
            confirmLabel: "Delete",
            variant: "destructive",
          });
          if (ok) {
            del.mutate(String(m.id), {
              onSuccess: () => toast.success("Payment method deleted."),
              onError: () => toast.error("Failed to delete payment method."),
            });
          }
        },
      }),
    [router, confirm, del, toast]
  );

  const columns = useMemo(() => getPaymentMethodTableColumns(), []);

  return (
    <EntityListWithCreateModal<PaymentMethod>
      data={methods}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      loadingText="Loading payment methods..."
      emptyText={search ? "No payment methods match your search." : "No payment methods yet."}
      error={
        error
          ? {
              message: "Failed to load payment methods.",
              onRetry: () => refetch(),
            }
          : undefined
      }
      topContent={
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search payment methods..."
          />
        </div>
      }
      pageSize={10}
      currentPage={pagination.page}
      totalPages={pagination.totalPages}
      totalItems={pagination.totalItems}
      onPageChange={(p) => pagination.setPage(p)}
      addLabel="New Method"
      createTitle="Create Payment Method"
      createSubmitText="Create Method"
      createLoadingText="Creating..."
      createFormId={CREATE_FORM_ID}
      createMaxWidth="2xl"
      renderCreateForm={({ formId, onSuccess, onLoadingChange }) => (
        <CreatePaymentMethodForm
          formId={formId}
          onSuccess={onSuccess}
          onLoadingChange={onLoadingChange}
        />
      )}
    />
  );
}

