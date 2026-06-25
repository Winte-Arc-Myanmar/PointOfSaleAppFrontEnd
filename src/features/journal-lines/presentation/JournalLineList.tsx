"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { useToast } from "@/presentation/providers/ToastProvider";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import {
  useJournalLines,
  useDeleteJournalLine,
} from "@/presentation/hooks/useJournalLines";
import { useJournalEntry } from "@/presentation/hooks/useJournalEntries";
import { usePagination } from "@/presentation/hooks/usePagination";
import type { JournalLine } from "@/core/domain/entities/JournalLine";
import { CreateJournalLineForm } from "./CreateJournalLineForm";
import { getJournalLineRowActions } from "./journal-line-row-actions";
import { getJournalLineTableColumns } from "./journal-line-table-columns";

const CREATE_FORM_ID = "create-journal-line-form";
const PAGE_SIZE = 10;

export interface JournalLineListProps {
  journalEntryId: string;
  routeBasePath?: string;
}

export function JournalLineList({
  journalEntryId,
  routeBasePath,
}: JournalLineListProps) {
  const router = useRouter();
  const pagination = usePagination({ pageSize: PAGE_SIZE });
  const { data: entry } = useJournalEntry(journalEntryId);
  const { data: linesResult, isLoading, error, refetch } = useJournalLines(
    journalEntryId,
    { page: pagination.page, limit: PAGE_SIZE, sortBy: "createdAt", sortOrder: "desc" }
  );
  const lines = linesResult?.items ?? [];
  const del = useDeleteJournalLine(journalEntryId);
  const toast = useToast();
  const confirm = useConfirm();

  const basePath = routeBasePath ?? `/journal-lines/${journalEntryId}`;

  const actions = useMemo(
    () =>
      getJournalLineRowActions({
        onView: (l) => router.push(`${basePath}/${l.id}`),
        onEdit: (l) => router.push(`${basePath}/${l.id}/edit`),
        onDelete: async (l) => {
          const ok = await confirm({
            title: "Delete journal line",
            description: "Delete this journal line? This cannot be undone.",
            confirmLabel: "Delete",
            variant: "destructive",
          });
          if (ok) {
            del.mutate(String(l.id), {
              onSuccess: () => toast.success("Journal line deleted."),
              onError: () => toast.error("Failed to delete journal line."),
            });
          }
        },
      }),
    [router, basePath, confirm, del, toast]
  );

  const columns = useMemo(
    () =>
      getJournalLineTableColumns({
        onView: (l) => router.push(`${basePath}/${l.id}`),
      }),
    [router, basePath]
  );

  return (
    <EntityListWithCreateModal<JournalLine>
      data={lines}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      loadingText="Loading journal lines..."
      emptyText="No journal lines yet."
      error={
        error
          ? {
              message: "Failed to load journal lines.",
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
      createTitle="Create Journal Line"
      createSubmitText="Create Line"
      createLoadingText="Creating..."
      createFormId={CREATE_FORM_ID}
      createMaxWidth="2xl"
      renderCreateForm={({ formId, onSuccess, onLoadingChange }) => (
        <CreateJournalLineForm
          journalEntryId={journalEntryId}
          tenantId={entry?.tenantId}
          formId={formId}
          onSuccess={onSuccess}
          onLoadingChange={onLoadingChange}
        />
      )}
    />
  );
}
