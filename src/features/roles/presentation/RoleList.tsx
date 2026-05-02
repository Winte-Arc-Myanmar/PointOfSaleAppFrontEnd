"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import { useDeleteRole, useRolesPaged } from "@/presentation/hooks/useRoles";
import { useInferredServerPagination } from "@/presentation/hooks/useInferredServerPagination";
import { getRoleRowActions } from "./role-row-actions";
import { getRoleTableColumns } from "./role-table-columns";
import { CreateRoleForm } from "./CreateRoleForm";
import type { Role } from "@/core/domain/entities/Role";

const CREATE_ROLE_FORM_ID = "create-role-form";
const PAGE_SIZE = 10;

export function RoleList() {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const pagination = useInferredServerPagination({ pageSize: PAGE_SIZE });
  const { data: roles = [], isLoading, error, refetch } = useRolesPaged({
    page: pagination.page,
    limit: PAGE_SIZE,
  });
  const deleteRole = useDeleteRole();

  useEffect(() => {
    pagination.observePageResult(roles.length);
  }, [roles.length, pagination]);

  const actions = useMemo(
    () =>
      getRoleRowActions({
        onView: (r) => router.push(`/roles/${r.id}`),
        onDelete: async (r) => {
          const ok = await confirm({
            title: "Delete role",
            description: r.isSystemDefault
              ? `\"${r.name}\" is a system default role and cannot be deleted.`
              : `Delete \"${r.name}\"? This cannot be undone.`,
            confirmLabel: "Delete",
            variant: "destructive",
          });
          if (!ok || r.isSystemDefault) return;
          deleteRole.mutate(r.id, {
            onSuccess: () => toast.success("Role deleted."),
            onError: () => toast.error("Failed to delete role."),
          });
        },
      }),
    [router, confirm, deleteRole, toast]
  );

  const columns = useMemo(() => getRoleTableColumns(), []);

  return (
    <EntityListWithCreateModal<Role>
      data={roles}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      loadingText="Loading roles..."
      emptyText="No roles yet."
      error={
        error
          ? {
              message: "Failed to load roles.",
              onRetry: () => refetch(),
            }
          : undefined
      }
      pageSize={10}
      currentPage={pagination.page}
      totalPages={pagination.totalPages}
      totalItems={pagination.totalItems}
      onPageChange={(p) => pagination.setPage(p)}
      addLabel="Add Role"
      createTitle="Create Role"
      createSubmitText="Create Role"
      createLoadingText="Creating..."
      createFormId={CREATE_ROLE_FORM_ID}
      createMaxWidth="lg"
      renderCreateForm={({ formId, onSuccess, onLoadingChange }) => (
        <CreateRoleForm
          formId={formId}
          onSuccess={onSuccess}
          onLoadingChange={onLoadingChange}
        />
      )}
    />
  );
}

