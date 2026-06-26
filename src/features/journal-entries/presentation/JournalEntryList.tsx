"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/presentation/components/ui/input";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { useToast } from "@/presentation/providers/ToastProvider";
import { usePagination } from "@/presentation/hooks/usePagination";
import {
  useJournalEntries,
  useDeleteJournalEntry,
} from "@/presentation/hooks/useJournalEntries";
import type { JournalEntry } from "@/core/domain/entities/JournalEntry";
import { CreateJournalEntryForm } from "./CreateJournalEntryForm";
import { getJournalEntryRowActions } from "./journal-entry-row-actions";
import { getJournalEntryTableColumns } from "./journal-entry-table-columns";

const CREATE_FORM_ID = "create-journal-entry-form";
const SEARCH_DEBOUNCE_MS = 300;
const PAGE_SIZE = 10;

export function JournalEntryList() {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const del = useDeleteJournalEntry();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const pagination = usePagination({ pageSize: PAGE_SIZE });

  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [searchInput]);

  const { data: entriesResult, isLoading, error, refetch } = useJournalEntries({
    search: search || undefined,
    page: pagination.page,
    limit: PAGE_SIZE,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const entries = entriesResult?.items ?? [];

  useEffect(() => {
    pagination.reset(1);
  }, [search, pagination.reset]);

  const actions = useMemo(
    () =>
      getJournalEntryRowActions({
        onView: (e) => router.push(`/journal-entries/${e.id}`),
        onEdit: (e) => router.push(`/journal-entries/${e.id}/edit`),
        onDelete: async (e) => {
          const ok = await confirm({
            title: "Delete journal entry",
            description: `Delete "${e.description}"? This cannot be undone.`,
            confirmLabel: "Delete",
            variant: "destructive",
          });
          if (ok) {
            del.mutate(String(e.id), {
              onSuccess: () => toast.success("Journal entry deleted."),
              onError: () => toast.error("Failed to delete journal entry."),
            });
          }
        },
      }),
    [router, confirm, del, toast]
  );

  const columns = useMemo(
    () =>
      getJournalEntryTableColumns({
        onView: (e) => router.push(`/journal-entries/${e.id}`),
      }),
    [router],
  );

  return (
    <EntityListWithCreateModal<JournalEntry>
      data={entries}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      loadingText="Loading journal entries..."
      emptyText={search ? "No journal entries match your search." : "No journal entries yet."}
      error={
        error
          ? {
              message: "Failed to load journal entries.",
              onRetry: () => refetch(),
            }
          : undefined
      }
      topContent={
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by description or source module..."
          />
        </div>
      }
      pageSize={PAGE_SIZE}
      currentPage={pagination.page}
      totalPages={entriesResult?.totalPages ?? pagination.getTotalPages(entriesResult?.total)}
      totalItems={entriesResult?.total ?? 0}
      onPageChange={pagination.setPage}
      addLabel="New Entry"
      createTitle="Create Journal Entry"
      createSubmitText="Create Entry"
      createLoadingText="Creating..."
      createFormId={CREATE_FORM_ID}
      createMaxWidth="2xl"
      renderCreateForm={({ formId, onSuccess, onLoadingChange }) => (
        <CreateJournalEntryForm
          formId={formId}
          onSuccess={onSuccess}
          onLoadingChange={onLoadingChange}
        />
      )}
    />
  );
}
