"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { useToast } from "@/presentation/providers/ToastProvider";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import {
  useDeleteLoyaltyLedgerEntry,
  useLoyaltyLedgerEntries,
} from "@/presentation/hooks/useLoyaltyLedger";
import { usePagination } from "@/presentation/hooks/usePagination";
import type { LoyaltyLedgerEntry } from "@/core/domain/entities/LoyaltyLedgerEntry";
import { CreateLoyaltyLedgerForm } from "./CreateLoyaltyLedgerForm";
import { getLoyaltyLedgerRowActions } from "./loyalty-ledger-row-actions";
import { getLoyaltyLedgerTableColumns } from "./loyalty-ledger-table-columns";

const CREATE_LOYALTY_LEDGER_FORM_ID = "create-loyalty-ledger-form";
const PAGE_SIZE = 10;

export interface LoyaltyLedgerListProps {
  customerId: string;
  /** Base URL for list/detail/edit (no trailing slash). Default: `/customers/:id/loyalty-ledger` */
  routeBasePath?: string;
}

export function LoyaltyLedgerList({
  customerId,
  routeBasePath,
}: LoyaltyLedgerListProps) {
  const router = useRouter();
  const pagination = usePagination({ pageSize: PAGE_SIZE });
  const {
    data: entriesResult,
    isLoading,
    error,
    refetch,
  } = useLoyaltyLedgerEntries(customerId, { page: pagination.page, limit: PAGE_SIZE });
  const entries = entriesResult?.items ?? [];
  const deleteEntry = useDeleteLoyaltyLedgerEntry();
  const toast = useToast();
  const confirm = useConfirm();

  const basePath =
    routeBasePath ?? `/customers/${customerId}/loyalty-ledger`;

  const actions = useMemo(
    () =>
      getLoyaltyLedgerRowActions({
        onView: (row) => router.push(`${basePath}/${row.id}`),
        onEdit: (row) => router.push(`${basePath}/${row.id}/edit`),
        onDelete: async (row) => {
          const ok = await confirm({
            title: "Delete loyalty entry",
            description: `Delete ${row.transactionType} (${row.points} pts)? This cannot be undone.`,
            confirmLabel: "Delete",
            variant: "destructive",
          });
          if (ok) {
            deleteEntry.mutate(
              { customerId, entryId: String(row.id) },
              {
                onSuccess: () => toast.success("Loyalty entry deleted."),
                onError: () => toast.error("Failed to delete loyalty entry."),
              }
            );
          }
        },
      }),
    [router, customerId, deleteEntry, toast, confirm, basePath]
  );

  const columns = useMemo(
    () =>
      getLoyaltyLedgerTableColumns({
        onView: (row) => router.push(`${basePath}/${row.id}`),
      }),
    [router, basePath],
  );

  return (
    <EntityListWithCreateModal<LoyaltyLedgerEntry>
      data={entries}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      loadingText="Loading loyalty ledger..."
      emptyText="No loyalty ledger entries yet."
      error={
        error
          ? {
              message: "Failed to load loyalty ledger.",
              onRetry: () => refetch(),
            }
          : undefined
      }
      pageSize={PAGE_SIZE}
      currentPage={pagination.page}
      totalPages={entriesResult?.totalPages ?? pagination.getTotalPages(entriesResult?.total)}
      totalItems={entriesResult?.total ?? 0}
      onPageChange={pagination.setPage}
      addLabel="Add entry"
      createTitle="Create loyalty ledger entry"
      createSubmitText="Create entry"
      createLoadingText="Creating..."
      createFormId={CREATE_LOYALTY_LEDGER_FORM_ID}
      createMaxWidth="md"
      renderCreateForm={({ formId, onSuccess, onLoadingChange }) => (
        <CreateLoyaltyLedgerForm
          customerId={customerId}
          formId={formId}
          onSuccess={onSuccess}
          onLoadingChange={onLoadingChange}
        />
      )}
    />
  );
}
