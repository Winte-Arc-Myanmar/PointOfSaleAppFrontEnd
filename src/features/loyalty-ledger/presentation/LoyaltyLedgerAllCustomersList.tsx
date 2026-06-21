"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { LoyaltyLedgerEntry } from "@/core/domain/entities/LoyaltyLedgerEntry";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useClientPagination } from "@/presentation/hooks/useClientPagination";
import {
  useAllCustomersLoyaltyLedgerEntries,
  useDeleteLoyaltyLedgerEntry,
} from "@/presentation/hooks/useLoyaltyLedger";
import { useLanguage } from "@/presentation/providers/LanguageProvider";
import { getLoyaltyLedgerTableColumns } from "./loyalty-ledger-table-columns";
import { getLoyaltyLedgerRowActions } from "./loyalty-ledger-row-actions";

const PER_CUSTOMER_FETCH_LIMIT = 50;
const PAGE_SIZE = 10;

export interface LoyaltyLedgerAllCustomersListProps {
  customerIds: string[];
}

export function LoyaltyLedgerAllCustomersList({
  customerIds,
}: LoyaltyLedgerAllCustomersListProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const deleteEntry = useDeleteLoyaltyLedgerEntry();

  const allRowsQuery = useAllCustomersLoyaltyLedgerEntries(customerIds, {
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
      getLoyaltyLedgerTableColumns({
        onView: (row) => router.push(`/loyalty-ledger/${row.customerId}/${row.id}`),
      }),
    [router],
  );

  const actions = useMemo(
    () =>
      getLoyaltyLedgerRowActions({
        onView: (row) => router.push(`/loyalty-ledger/${row.customerId}/${row.id}`),
        onEdit: (row) =>
          router.push(`/loyalty-ledger/${row.customerId}/${row.id}/edit`),
        onDelete: async (row: LoyaltyLedgerEntry) => {
          const ok = await confirm({
            title: "Delete loyalty entry",
            description: `Delete ${row.transactionType} (${row.points} pts)? This cannot be undone.`,
            confirmLabel: "Delete",
            variant: "destructive",
          });
          if (!ok) return;
          deleteEntry.mutate(
            { customerId: row.customerId, entryId: String(row.id) },
            {
              onSuccess: async () => {
                toast.success("Loyalty entry deleted.");
                await allRowsQuery.refetch();
              },
              onError: () => toast.error("Failed to delete loyalty entry."),
            },
          );
        },
      }),
    [router, confirm, deleteEntry, toast, allRowsQuery],
  );

  return (
    <EntityListWithCreateModal<LoyaltyLedgerEntry>
      data={pagination.items}
      columns={columns}
      actions={actions}
      isLoading={allRowsQuery.isLoading}
      loadingText={t("loyaltyPage.loadingLoyaltyLedger")}
      emptyText={t("loyaltyPage.noLoyaltyEntriesYet")}
      error={
        allRowsQuery.error
          ? {
              message: t("loyaltyPage.failedToLoadLoyaltyLedger"),
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
