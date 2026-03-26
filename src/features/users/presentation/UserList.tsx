"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useUsers, useDeleteUser } from "@/presentation/hooks/useUsers";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { Button } from "@/presentation/components/ui/button";
import { DataTable } from "@/presentation/components/data-table";
import { FormModal } from "@/presentation/components/modal/FormModal";
import { getUserRowActions } from "./user-row-actions";
import { getUserTableColumns } from "./user-table-columns";
import { CreateUserForm } from "./CreateUserForm";
import type { AppUser } from "@/core/domain/entities/AppUser";

const CREATE_USER_FORM_ID = "create-user-form";

export function UserList() {
  const router = useRouter();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createFormLoading, setCreateFormLoading] = useState(false);
  const { data: users = [], isLoading, error, refetch } = useUsers();
  const deleteUser = useDeleteUser();
  const toast = useToast();
  const confirm = useConfirm();

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
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>
      <DataTable<AppUser>
        data={users}
        columns={columns}
        actions={actions}
        isLoading={isLoading}
        loadingText="Loading users..."
        emptyText="No users yet."
        emptyAction={{
          label: "Add User",
          onClick: () => setCreateModalOpen(true),
        }}
        error={
          error
            ? {
                message: "Failed to load users. Is the backend API running?",
                onRetry: () => refetch(),
              }
            : undefined
        }
        pageSize={10}
      />
      <FormModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create User"
        formId={CREATE_USER_FORM_ID}
        formContent={
          <CreateUserForm
            formId={CREATE_USER_FORM_ID}
            onSuccess={() => setCreateModalOpen(false)}
            onLoadingChange={setCreateFormLoading}
          />
        }
        submitText="Create User"
        loadingText="Creating..."
        isLoading={createFormLoading}
        maxWidth="2xl"
      />
    </>
  );
}
