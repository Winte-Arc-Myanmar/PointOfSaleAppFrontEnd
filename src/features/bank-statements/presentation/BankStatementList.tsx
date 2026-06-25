"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/presentation/components/ui/input";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { useToast } from "@/presentation/providers/ToastProvider";
import { usePagination } from "@/presentation/hooks/usePagination";
import {
  useBankStatements,
  useDeleteBankStatement,
} from "@/presentation/hooks/useBankStatements";
import type { BankStatement } from "@/core/domain/entities/BankStatement";
import { CreateBankStatementForm } from "./CreateBankStatementForm";
import { getBankStatementRowActions } from "./bank-statement-row-actions";
import { getBankStatementTableColumns } from "./bank-statement-table-columns";

const CREATE_FORM_ID = "create-bank-statement-form";
const SEARCH_DEBOUNCE_MS = 300;
const PAGE_SIZE = 10;

export function BankStatementList() {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const del = useDeleteBankStatement();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const pagination = usePagination({ pageSize: PAGE_SIZE });

  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [searchInput]);

  const { data: statementsResult, isLoading, error, refetch } = useBankStatements({
    search: search || undefined,
    page: pagination.page,
    limit: PAGE_SIZE,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const statements = statementsResult?.items ?? [];

  useEffect(() => {
    pagination.reset(1);
  }, [search, pagination.reset]);

  const actions = useMemo(
    () =>
      getBankStatementRowActions({
        onView: (s) => router.push(`/bank-statements/${s.id}`),
        onEdit: (s) => router.push(`/bank-statements/${s.id}/edit`),
        onDelete: async (s) => {
          const ok = await confirm({
            title: "Delete bank statement",
            description: `Delete statement dated ${s.statementDate}? This cannot be undone.`,
            confirmLabel: "Delete",
            variant: "destructive",
          });
          if (ok) {
            del.mutate(String(s.id), {
              onSuccess: () => toast.success("Bank statement deleted."),
              onError: () => toast.error("Failed to delete bank statement."),
            });
          }
        },
      }),
    [router, confirm, del, toast]
  );

  const columns = useMemo(
    () =>
      getBankStatementTableColumns({
        onView: (s) => router.push(`/bank-statements/${s.id}`),
      }),
    [router],
  );

  return (
    <EntityListWithCreateModal<BankStatement>
      data={statements}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      loadingText="Loading bank statements..."
      emptyText={search ? "No bank statements match your search." : "No bank statements yet."}
      error={
        error
          ? {
              message: "Failed to load bank statements.",
              onRetry: () => refetch(),
            }
          : undefined
      }
      topContent={
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search bank statements..."
          />
        </div>
      }
      pageSize={PAGE_SIZE}
      currentPage={pagination.page}
      totalPages={
        statementsResult?.totalPages ?? pagination.getTotalPages(statementsResult?.total)
      }
      totalItems={statementsResult?.total ?? 0}
      onPageChange={pagination.setPage}
      addLabel="New Statement"
      createTitle="Create Bank Statement"
      createSubmitText="Create Statement"
      createLoadingText="Creating..."
      createFormId={CREATE_FORM_ID}
      createMaxWidth="2xl"
      renderCreateForm={({ formId, onSuccess, onLoadingChange }) => (
        <CreateBankStatementForm
          formId={formId}
          onSuccess={onSuccess}
          onLoadingChange={onLoadingChange}
        />
      )}
    />
  );
}
