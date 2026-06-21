"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { CustomerInteraction } from "@/core/domain/entities/CustomerInteraction";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useClientPagination } from "@/presentation/hooks/useClientPagination";
import {
  useAllCustomersCustomerInteractions,
  useDeleteCustomerInteraction,
} from "@/presentation/hooks/useCustomerInteractions";
import { useLanguage } from "@/presentation/providers/LanguageProvider";
import { getCustomerInteractionTableColumns } from "./customer-interaction-table-columns";
import { getCustomerInteractionRowActions } from "./customer-interaction-row-actions";

const PER_CUSTOMER_FETCH_LIMIT = 50;
const PAGE_SIZE = 10;

export interface CustomerInteractionsAllCustomersListProps {
  customerIds: string[];
}

export function CustomerInteractionsAllCustomersList({
  customerIds,
}: CustomerInteractionsAllCustomersListProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const deleteInteraction = useDeleteCustomerInteraction();

  const allRowsQuery = useAllCustomersCustomerInteractions(customerIds, {
    page: 1,
    limit: PER_CUSTOMER_FETCH_LIMIT,
  });

  const rows = allRowsQuery.data ?? [];
  const pagination = useClientPagination(rows, { pageSize: PAGE_SIZE });

  useEffect(() => {
    pagination.reset(1);
  }, [customerIds.join(","), pagination.reset]);

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

  return (
    <EntityListWithCreateModal<CustomerInteraction>
      data={pagination.items}
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
      pageSize={PAGE_SIZE}
      currentPage={pagination.page}
      totalPages={pagination.totalPages}
      totalItems={pagination.totalItems}
      onPageChange={pagination.setPage}
      createEnabled={false}
      showActionBar={false}
    />
  );
}
