"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { useToast } from "@/presentation/providers/ToastProvider";
import { Input } from "@/presentation/components/ui/input";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import { useCustomers, useDeleteCustomer } from "@/presentation/hooks/useCustomers";
import type { Customer } from "@/core/domain/entities/Customer";
import { CreateCustomerForm } from "./CreateCustomerForm";
import { getCustomerRowActions } from "./customer-row-actions";
import { getCustomerTableColumns } from "./customer-table-columns";

const CREATE_CUSTOMER_FORM_ID = "create-customer-form";

const SEARCH_DEBOUNCE_MS = 300;

export interface CustomerListProps {
  showSearch?: boolean;
}

export function CustomerList({ showSearch = true }: CustomerListProps) {
  const router = useRouter();
  const deleteCustomer = useDeleteCustomer();
  const toast = useToast();
  const confirm = useConfirm();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [searchInput]);

  const { data: customers = [], isLoading, error, refetch } = useCustomers({
    search: search || undefined,
  });

  const actions = useMemo(
    () =>
      getCustomerRowActions({
        onView: (c) => router.push(`/customers/${c.id}`),
        onEdit: (c) => router.push(`/customers/${c.id}/edit`),
        onDelete: async (c) => {
          const ok = await confirm({
            title: "Delete customer",
            description: `Delete "${c.name}"? This cannot be undone.`,
            confirmLabel: "Delete",
            variant: "destructive",
          });
          if (ok) {
            deleteCustomer.mutate(String(c.id), {
              onSuccess: () => toast.success("Customer deleted."),
              onError: () => toast.error("Failed to delete customer."),
            });
          }
        },
      }),
    [router, deleteCustomer, toast, confirm]
  );

  const columns = useMemo(() => getCustomerTableColumns(), []);

  return (
    <div className="space-y-4">
      <EntityListWithCreateModal<Customer>
        data={customers}
        columns={columns}
        actions={actions}
        isLoading={isLoading}
        loadingText="Loading customers..."
        emptyText={search ? "No customers match your search." : "No customers yet."}
        topContent={
          showSearch ? (
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search customers by name, phone, or email..."
                className="sm:max-w-md"
              />
              {search && (
                <p className="text-sm text-muted">
                  Showing results for{" "}
                  <span className="font-medium text-foreground">"{search}"</span>
                </p>
              )}
            </div>
          ) : null
        }
        error={
          error
            ? {
                message: "Failed to load customers.",
                onRetry: () => refetch(),
              }
            : undefined
        }
        pageSize={10}
        addLabel="Add Customer"
        createTitle="Create Customer"
        createSubmitText="Create Customer"
        createLoadingText="Creating..."
        createFormId={CREATE_CUSTOMER_FORM_ID}
        createMaxWidth="lg"
        renderCreateForm={({ formId, onSuccess, onLoadingChange }) => (
          <CreateCustomerForm
            formId={formId}
            onSuccess={onSuccess}
            onLoadingChange={onLoadingChange}
          />
        )}
      />
    </div>
  );
}

