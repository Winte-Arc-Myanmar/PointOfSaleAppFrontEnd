"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import type { CustomerInteraction } from "@/core/domain/entities/CustomerInteraction";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { useToast } from "@/presentation/providers/ToastProvider";
import { usePagination } from "@/presentation/hooks/usePagination";
import {
  useAllCustomersCustomerInteractions,
  useDeleteCustomerInteraction,
} from "@/presentation/hooks/useCustomerInteractions";
import { useLanguage } from "@/presentation/providers/LanguageProvider";
import { getCustomerInteractionTableColumns } from "./customer-interaction-table-columns";
import { getCustomerInteractionRowActions } from "./customer-interaction-row-actions";

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

  const pagination = usePagination({ pageSize: PAGE_SIZE });
  const allRowsQuery = useAllCustomersCustomerInteractions(customerIds, {
    page: pagination.page,
    limit: PAGE_SIZE,
  });
  const rows = allRowsQuery.data?.items ?? [];

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
      data={rows}
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
      totalPages={pagination.getTotalPages(allRowsQuery.data?.total)}
      totalItems={allRowsQuery.data?.total ?? 0}
      onPageChange={pagination.setPage}
      createEnabled={false}
      showActionBar={false}
    />
  );
}
