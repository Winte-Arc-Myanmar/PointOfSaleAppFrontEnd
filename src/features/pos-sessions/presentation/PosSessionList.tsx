"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useDeletePosSession, usePosSessions } from "@/presentation/hooks/usePosSessions";
import { useInferredServerPagination } from "@/presentation/hooks/useInferredServerPagination";
import type { PosSession } from "@/core/domain/entities/PosSession";
import { CreatePosSessionForm } from "./CreatePosSessionForm";
import { getPosSessionRowActions } from "./pos-session-row-actions";
import { getPosSessionTableColumns } from "./pos-session-table-columns";

const CREATE_FORM_ID = "create-pos-session-form";
const PAGE_SIZE = 10;

export function PosSessionList() {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const del = useDeletePosSession();
  const pagination = useInferredServerPagination({ pageSize: PAGE_SIZE });

  const { data: sessions = [], isLoading, error, refetch } = usePosSessions({
    page: pagination.page,
    limit: PAGE_SIZE,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  useEffect(() => {
    pagination.observePageResult(sessions.length);
  }, [sessions.length, pagination]);

  const actions = useMemo(
    () =>
      getPosSessionRowActions({
        onView: (s) => router.push(`/pos-sessions/${s.id}`),
        onEdit: (s) => router.push(`/pos-sessions/${s.id}/edit`),
        onDelete: async (s) => {
          const ok = await confirm({
            title: "Delete POS session",
            description: `Delete this session? This cannot be undone.`,
            confirmLabel: "Delete",
            variant: "destructive",
          });
          if (ok) {
            del.mutate(String(s.id), {
              onSuccess: () => toast.success("POS session deleted."),
              onError: () => toast.error("Failed to delete POS session."),
            });
          }
        },
      }),
    [router, confirm, del, toast]
  );

  const columns = useMemo(() => getPosSessionTableColumns(), []);

  return (
    <EntityListWithCreateModal<PosSession>
      data={sessions}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      loadingText="Loading POS sessions..."
      emptyText="No POS sessions yet."
      error={
        error
          ? {
              message: "Failed to load POS sessions.",
              onRetry: () => refetch(),
            }
          : undefined
      }
      pageSize={10}
      currentPage={pagination.page}
      totalPages={pagination.totalPages}
      totalItems={pagination.totalItems}
      onPageChange={(p) => pagination.setPage(p)}
      addLabel="New Session"
      createTitle="Create POS Session"
      createSubmitText="Create session"
      createLoadingText="Creating..."
      createFormId={CREATE_FORM_ID}
      createMaxWidth="2xl"
      renderCreateForm={({ formId, onSuccess, onLoadingChange }) => (
        <CreatePosSessionForm
          formId={formId}
          onSuccess={onSuccess}
          onLoadingChange={onLoadingChange}
        />
      )}
    />
  );
}

