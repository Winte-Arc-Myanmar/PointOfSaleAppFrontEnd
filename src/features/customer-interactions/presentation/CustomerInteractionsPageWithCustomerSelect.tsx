"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { CustomerInteraction } from "@/core/domain/entities/CustomerInteraction";
import { DataTable } from "@/presentation/components/data-table";
import { Label } from "@/presentation/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { useCustomers } from "@/presentation/hooks/useCustomers";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { useToast } from "@/presentation/providers/ToastProvider";
import {
  useAllCustomersCustomerInteractions,
  useDeleteCustomerInteraction,
} from "@/presentation/hooks/useCustomerInteractions";
import { useLanguage } from "@/presentation/providers/LanguageProvider";
import { CustomerInteractionList } from "./CustomerInteractionList";
import { getCustomerInteractionTableColumns } from "./customer-interaction-table-columns";
import { getCustomerInteractionRowActions } from "./customer-interaction-row-actions";

const CUSTOMER_LIST_LIMIT = 500;
const ALL_CUSTOMERS = "__all__";
const PER_CUSTOMER_FETCH_LIMIT = 50;

export function CustomerInteractionsPageWithCustomerSelect() {
  const { t } = useLanguage();
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const deleteInteraction = useDeleteCustomerInteraction();
  const { data: customers = [], isLoading } = useCustomers({
    page: 1,
    limit: CUSTOMER_LIST_LIMIT,
  });
  const [selectedId, setSelectedId] = useState<string>(ALL_CUSTOMERS);

  const sorted = useMemo(
    () => [...customers].sort((a, b) => a.name.localeCompare(b.name)),
    [customers],
  );

  const customerIds = useMemo(
    () => sorted.map((customer) => String(customer.id)),
    [sorted],
  );

  const allRowsQuery = useAllCustomersCustomerInteractions(customerIds, {
    page: 1,
    limit: PER_CUSTOMER_FETCH_LIMIT,
  });

  const columns = useMemo(
    () =>
      getCustomerInteractionTableColumns({
        onView: (row) =>
          router.push(`/customer-interactions/${row.customerId}/${row.id}`),
      }),
    [router],
  );

  const actions = useMemo(
    () =>
      getCustomerInteractionRowActions({
        onView: (row) =>
          router.push(`/customer-interactions/${row.customerId}/${row.id}`),
        onEdit: (row) =>
          router.push(`/customer-interactions/${row.customerId}/${row.id}/edit`),
        onDelete: async (row: CustomerInteraction) => {
          const ok = await confirm({
            title: "Delete interaction",
            description: `Delete this ${row.interactionType} interaction? This cannot be undone.`,
            confirmLabel: "Delete",
            variant: "destructive",
          });
          if (!ok) return;
          deleteInteraction.mutate(
            { customerId: row.customerId, interactionId: String(row.id) },
            {
              onSuccess: async () => {
                toast.success("Interaction deleted.");
                await allRowsQuery.refetch();
              },
              onError: () => toast.error("Failed to delete interaction."),
            },
          );
        },
      }),
    [router, confirm, deleteInteraction, toast, allRowsQuery],
  );

  const isAllMode = selectedId === ALL_CUSTOMERS;

  return (
    <div className="space-y-6">
      <div className="grid gap-2 max-w-md">
        <Label htmlFor="customer-select-interactions">{t("common.customer")}</Label>
        <Select
          value={selectedId}
          onValueChange={setSelectedId}
          disabled={isLoading}
        >
          <SelectTrigger id="customer-select-interactions">
            <SelectValue
              placeholder={
                isLoading ? t("common.loadingCustomers") : t("common.allCustomers")
              }
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_CUSTOMERS}>{t("common.allCustomers")}</SelectItem>
            {sorted.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isAllMode ? (
        <DataTable<CustomerInteraction>
          data={allRowsQuery.data ?? []}
          columns={columns}
          actions={actions}
          isLoading={allRowsQuery.isLoading}
          loadingText={t("interactionsPage.loadingInteractions")}
          emptyText={t("interactionsPage.noInteractionsYet")}
          error={
            allRowsQuery.error
              ? {
                  message: t("interactionsPage.failedToLoadInteractions"),
                  onRetry: () => allRowsQuery.refetch(),
                }
              : undefined
          }
          pageSize={10}
        />
      ) : (
        <CustomerInteractionList
          customerId={selectedId}
          routeBasePath={`/customer-interactions/${selectedId}`}
        />
      )}
    </div>
  );
}
