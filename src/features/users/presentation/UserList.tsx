"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useUsers, useDeleteUser } from "@/presentation/hooks/useUsers";
import { useInferredServerPagination } from "@/presentation/hooks/useInferredServerPagination";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import { getUserRowActions } from "./user-row-actions";
import { getUserTableColumns } from "./user-table-columns";
import { CreateUserForm } from "./CreateUserForm";
import type { AppUser } from "@/core/domain/entities/AppUser";

const CREATE_USER_FORM_ID = "create-user-form";
const PAGE_SIZE = 10;

export function UserList() {
  const router = useRouter();
  const pagination = useInferredServerPagination({ pageSize: PAGE_SIZE });
  const { data: users = [], isLoading, error, refetch } = useUsers({
    page: pagination.page,
    limit: PAGE_SIZE,
  });
  const deleteUser = useDeleteUser();
  const toast = useToast();
  const confirm = useConfirm();

  useEffect(() => {
    pagination.observePageResult(users.length);
  }, [users.length, pagination]);

  const actions = useMemo(
    () =>
      getUserRowActions({
        onView: (u) => router.push(`/users/${u.id}`),
        onEdit: (u) => router.push(`/users/${u.id}/edit`),
        onDelete: async (u) => {
          const ok = await confirm({
            title: "Delete user",
            description: `Delete "${u.fullName}"? This cannot be undone.`,
            confirmLabel: "Delete",
            variant: "destructive",
          });
          if (ok) {
            deleteUser.mutate(u.id, {
              onSuccess: () => toast.success("User deleted."),
              onError: () => toast.error("Failed to delete user."),
            });
          }
        },
      }),
    [router, deleteUser, toast, confirm]
  );

  const columns = useMemo(() => getUserTableColumns(), []);

  return (
    <EntityListWithCreateModal<AppUser>
      data={users}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      loadingText="Loading users..."
      emptyText="No users yet."
      error={
        error
          ? {
              message: "Failed to load users. Is the backend API running?",
              onRetry: () => refetch(),
            }
          : undefined
      }
      pageSize={10}
      currentPage={pagination.page}
      totalPages={pagination.totalPages}
      totalItems={pagination.totalItems}
      onPageChange={(p) => pagination.setPage(p)}
      addLabel="Add User"
      createTitle="Create User"
      createSubmitText="Create User"
      createLoadingText="Creating..."
      createFormId={CREATE_USER_FORM_ID}
      createMaxWidth="2xl"
      renderCreateForm={({ formId, onSuccess, onLoadingChange }) => (
        <CreateUserForm
          formId={formId}
          onSuccess={onSuccess}
          onLoadingChange={onLoadingChange}
        />
      )}
    />
  );
}
