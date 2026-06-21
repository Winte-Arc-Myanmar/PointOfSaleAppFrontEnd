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
import {
  useCustomers,
  useDeleteCustomer,
} from "@/presentation/hooks/useCustomers";
import { useInferredServerPagination } from "@/presentation/hooks/useInferredServerPagination";
import type { Customer } from "@/core/domain/entities/Customer";
import { CreateCustomerForm } from "./CreateCustomerForm";
import { getCustomerRowActions } from "./customer-row-actions";
import { getCustomerTableColumns } from "./customer-table-columns";
import { useLanguage } from "@/presentation/providers/LanguageProvider";

const CREATE_CUSTOMER_FORM_ID = "create-customer-form";

const SEARCH_DEBOUNCE_MS = 300;
const PAGE_SIZE = 10;

export interface CustomerListProps {
  showSearch?: boolean;
}

export function CustomerList({ showSearch = true }: CustomerListProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const deleteCustomer = useDeleteCustomer();
  const toast = useToast();
  const confirm = useConfirm();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [selectedLoyaltyTier, setSelectedLoyaltyTier] = useState("__all__");
  const [selectedAccountType, setSelectedAccountType] = useState("__all__");
  const pagination = useInferredServerPagination({ pageSize: PAGE_SIZE });

  useEffect(() => {
    const id = setTimeout(
      () => setSearch(searchInput.trim()),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(id);
  }, [searchInput]);

  const {
    data: customers = [],
    isLoading,
    error,
    refetch,
  } = useCustomers({
    page: pagination.page,
    limit: PAGE_SIZE,
    search: search || undefined,
  });

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const loyaltyOk =
        selectedLoyaltyTier === "__all__" ||
        String(customer.loyaltyTier).toUpperCase() === selectedLoyaltyTier;
      const accountTypeOk =
        selectedAccountType === "__all__" ||
        String(customer.accountType).toUpperCase() === selectedAccountType;
      return loyaltyOk && accountTypeOk;
    });
  }, [customers, selectedLoyaltyTier, selectedAccountType]);

  const accountTypeOptions = useMemo(() => {
    const types = new Set<string>();
    customers.forEach((customer) => {
      const value = String(customer.accountType ?? "").trim().toUpperCase();
      if (value) types.add(value);
    });
    return Array.from(types).sort((a, b) => a.localeCompare(b));
  }, [customers]);

  useEffect(() => {
    pagination.observePageResult(filteredCustomers.length);
  }, [filteredCustomers.length, pagination.observePageResult]);

  useEffect(() => {
    // New search => go back to page 1 and drop any inferred max page.
    pagination.reset(1);
  }, [search, pagination.reset]);

  useEffect(() => {
    // New loyalty tier filter => go back to page 1.
    pagination.reset(1);
  }, [selectedLoyaltyTier, pagination.reset]);

  useEffect(() => {
    pagination.reset(1);
  }, [selectedAccountType, pagination.reset]);

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
    [router, deleteCustomer, toast, confirm],
  );

  const columns = useMemo(
    () =>
      getCustomerTableColumns({
        onView: (c) => router.push(`/customers/${c.id}`),
      }),
    [router],
  );

  async function handleDeleteSelected(items: Customer[]) {
    if (items.length === 0) return;
    const ok = await confirm({
      title: "Delete customers",
      description: `Delete ${items.length} selected customer(s)? This cannot be undone.`,
      confirmLabel: "Delete",
      variant: "destructive",
    });
    if (!ok) return;
    try {
      for (const item of items) {
        await deleteCustomer.mutateAsync(String(item.id));
      }
      toast.success(`${items.length} customer(s) deleted.`);
    } catch {
      toast.error("Failed to delete some customers.");
    }
  }

  return (
    <div className="space-y-4">
      <EntityListWithCreateModal<Customer>
        data={filteredCustomers}
        columns={columns}
        actions={actions}
        isLoading={isLoading}
        loadingText={t("customerPage.loadingCustomers")}
        emptyText={
          search
            ? t("customerPage.noCustomersMatchSearch")
            : selectedLoyaltyTier !== "__all__"
              ? t("customerPage.noCustomersMatchLoyaltyTier")
              : selectedAccountType !== "__all__"
                ? t("customerPage.noCustomersMatchAccountType")
              : t("customerPage.noCustomersYet")
        }
        topContent={
          showSearch ? (
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t("customerPage.searchPlaceholder")}
                className="sm:w-[360px]"
              />
              <Select
                value={selectedLoyaltyTier}
                onValueChange={setSelectedLoyaltyTier}
              >
                <SelectTrigger className="sm:w-[200px]">
                  <SelectValue placeholder={t("customerPage.filterByLoyaltyTier")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">{t("customerPage.allLoyaltyTiers")}</SelectItem>
                  <SelectItem value="BRONZE">Bronze</SelectItem>
                  <SelectItem value="SILVER">Silver</SelectItem>
                  <SelectItem value="GOLD">Gold</SelectItem>
                  <SelectItem value="PLATINUM">Platinum</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={selectedAccountType}
                onValueChange={setSelectedAccountType}
              >
                <SelectTrigger className="sm:w-[200px]">
                  <SelectValue placeholder={t("customerPage.filterByAccountType")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">{t("customerPage.allAccountTypes")}</SelectItem>
                  {accountTypeOptions.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {search && (
                <p className="text-sm text-muted">
                  {t("customerPage.showingResultsFor")}{" "}
                  <span className="font-medium text-foreground">
                    &quot;{search}&quot;
                  </span>
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
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        onPageChange={(p) => pagination.setPage(p)}
        addLabel={t("customerPage.addCustomer")}
        createTitle={t("customerPage.createCustomer")}
        createSubmitText={t("customerPage.createCustomer")}
        createLoadingText={t("customerPage.creating")}
        createFormId={CREATE_CUSTOMER_FORM_ID}
        createMaxWidth="lg"
        enableRowSelection
        onEditSelected={(item) => router.push(`/customers/${item.id}/edit`)}
        onDeleteSelected={handleDeleteSelected}
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
