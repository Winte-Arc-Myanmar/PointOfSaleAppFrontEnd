"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { useToast } from "@/presentation/providers/ToastProvider";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import {
  useBankStatementLines,
  useDeleteBankStatementLine,
} from "@/presentation/hooks/useBankStatementLines";
import { useBankStatement } from "@/presentation/hooks/useBankStatements";
import { usePagination } from "@/presentation/hooks/usePagination";
import type { BankStatementLine } from "@/core/domain/entities/BankStatementLine";
import { CreateBankStatementLineForm } from "./CreateBankStatementLineForm";
import { getBankStatementLineRowActions } from "./bank-statement-line-row-actions";
import { getBankStatementLineTableColumns } from "./bank-statement-line-table-columns";

const CREATE_FORM_ID = "create-bank-statement-line-form";
const PAGE_SIZE = 10;

export interface BankStatementLineListProps {
  bankStatementId: string;
  routeBasePath?: string;
}

export function BankStatementLineList({
  bankStatementId,
  routeBasePath,
}: BankStatementLineListProps) {
  const router = useRouter();
  const pagination = usePagination({ pageSize: PAGE_SIZE });
  useBankStatement(bankStatementId);
  const { data: linesResult, isLoading, error, refetch } = useBankStatementLines(
    bankStatementId,
    { page: pagination.page, limit: PAGE_SIZE, sortBy: "createdAt", sortOrder: "desc" }
  );
  const lines = linesResult?.items ?? [];
  const del = useDeleteBankStatementLine(bankStatementId);
  const toast = useToast();
  const confirm = useConfirm();

  const basePath = routeBasePath ?? `/bank-statement-lines/${bankStatementId}`;

  const actions = useMemo(
    () =>
      getBankStatementLineRowActions({
        onView: (l) => router.push(`${basePath}/${l.id}`),
        onEdit: (l) => router.push(`${basePath}/${l.id}/edit`),
        onDelete: async (l) => {
          const ok = await confirm({
            title: "Delete statement line",
            description: "Delete this bank statement line? This cannot be undone.",
            confirmLabel: "Delete",
            variant: "destructive",
          });
          if (ok) {
            del.mutate(String(l.id), {
              onSuccess: () => toast.success("Bank statement line deleted."),
              onError: () => toast.error("Failed to delete bank statement line."),
            });
          }
        },
      }),
    [router, basePath, confirm, del, toast]
  );

  const columns = useMemo(
    () =>
      getBankStatementLineTableColumns({
        onView: (l) => router.push(`${basePath}/${l.id}`),
      }),
    [router, basePath]
  );

  return (
    <EntityListWithCreateModal<BankStatementLine>
      data={lines}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      loadingText="Loading bank statement lines..."
      emptyText="No bank statement lines yet."
      error={
        error
          ? {
              message: "Failed to load bank statement lines.",
              onRetry: () => refetch(),
            }
          : undefined
      }
      pageSize={PAGE_SIZE}
      currentPage={pagination.page}
      totalPages={linesResult?.totalPages ?? pagination.getTotalPages(linesResult?.total)}
      totalItems={linesResult?.total ?? 0}
      onPageChange={pagination.setPage}
      addLabel="New Line"
      createTitle="Create Bank Statement Line"
      createSubmitText="Create Line"
      createLoadingText="Creating..."
      createFormId={CREATE_FORM_ID}
      createMaxWidth="2xl"
      renderCreateForm={({ formId, onSuccess, onLoadingChange }) => (
        <CreateBankStatementLineForm
          bankStatementId={bankStatementId}
          formId={formId}
          onSuccess={onSuccess}
          onLoadingChange={onLoadingChange}
        />
      )}
    />
  );
}
