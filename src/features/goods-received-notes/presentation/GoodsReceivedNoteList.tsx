"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/presentation/components/ui/input";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { useToast } from "@/presentation/providers/ToastProvider";
import { usePagination } from "@/presentation/hooks/usePagination";
import {
  useGoodsReceivedNotes,
  useDeleteGoodsReceivedNote,
} from "@/presentation/hooks/useGoodsReceivedNotes";
import type { GoodsReceivedNote } from "@/core/domain/entities/GoodsReceivedNote";
import { CreateGoodsReceivedNoteForm } from "./CreateGoodsReceivedNoteForm";
import { getGoodsReceivedNoteRowActions } from "./goods-received-note-row-actions";
import { getGoodsReceivedNoteTableColumns } from "./goods-received-note-table-columns";

const CREATE_FORM_ID = "create-goods-received-note-form";
const SEARCH_DEBOUNCE_MS = 300;
const PAGE_SIZE = 10;

export function GoodsReceivedNoteList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultPurchaseOrderId =
    searchParams.get("purchaseOrderId") ?? undefined;
  const toast = useToast();
  const confirm = useConfirm();
  const del = useDeleteGoodsReceivedNote();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const pagination = usePagination({ pageSize: PAGE_SIZE });

  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [searchInput]);

  const { data: notesResult, isLoading, error, refetch } = useGoodsReceivedNotes({
    search: search || undefined,
    page: pagination.page,
    limit: PAGE_SIZE,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const notes = notesResult?.items ?? [];

  useEffect(() => {
    pagination.reset(1);
  }, [search, pagination.reset]);

  const actions = useMemo(
    () =>
      getGoodsReceivedNoteRowActions({
        onView: (n) => router.push(`/goods-received-notes/${n.id}`),
        onEdit: (n) => router.push(`/goods-received-notes/${n.id}/edit`),
        onDelete: async (n) => {
          const ok = await confirm({
            title: "Delete goods received note",
            description: `Delete GRN ${n.grnNumber}? This cannot be undone.`,
            confirmLabel: "Delete",
            variant: "destructive",
          });
          if (ok) {
            del.mutate(String(n.id), {
              onSuccess: () => toast.success("Goods received note deleted."),
              onError: () => toast.error("Failed to delete goods received note."),
            });
          }
        },
      }),
    [router, confirm, del, toast]
  );

  const columns = useMemo(
    () =>
      getGoodsReceivedNoteTableColumns({
        onView: (n) => router.push(`/goods-received-notes/${n.id}`),
      }),
    [router],
  );

  return (
    <EntityListWithCreateModal<GoodsReceivedNote>
      data={notes}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      loadingText="Loading goods received notes..."
      emptyText={search ? "No goods received notes match your search." : "No goods received notes yet."}
      error={
        error
          ? {
              message: "Failed to load goods received notes.",
              onRetry: () => refetch(),
            }
          : undefined
      }
      topContent={
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search goods received notes..."
          />
        </div>
      }
      pageSize={PAGE_SIZE}
      currentPage={pagination.page}
      totalPages={
        notesResult?.totalPages ?? pagination.getTotalPages(notesResult?.total)
      }
      totalItems={notesResult?.total ?? 0}
      onPageChange={pagination.setPage}
      addLabel="New Goods Received Note"
      createTitle="Create Goods Received Note"
      createSubmitText="Create Goods Received Note"
      createLoadingText="Creating..."
      createFormId={CREATE_FORM_ID}
      createMaxWidth="2xl"
      renderCreateForm={({ formId, onSuccess, onLoadingChange }) => (
        <CreateGoodsReceivedNoteForm
          formId={formId}
          onSuccess={onSuccess}
          onLoadingChange={onLoadingChange}
          defaultPurchaseOrderId={defaultPurchaseOrderId}
        />
      )}
    />
  );
}
