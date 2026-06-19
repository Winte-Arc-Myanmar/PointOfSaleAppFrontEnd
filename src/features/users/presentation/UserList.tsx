"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useUsers, useDeleteUser } from "@/presentation/hooks/useUsers";
import { useInferredServerPagination } from "@/presentation/hooks/useInferredServerPagination";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { Input } from "@/presentation/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import { getUserRowActions } from "./user-row-actions";
import { getUserTableColumns } from "./user-table-columns";
import { CreateUserForm } from "./CreateUserForm";
import type { AppUser } from "@/core/domain/entities/AppUser";

const CREATE_USER_FORM_ID = "create-user-form";
const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

export function UserList() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [selectedJobTitle, setSelectedJobTitle] = useState("__all__");
  const pagination = useInferredServerPagination({ pageSize: PAGE_SIZE });
  const { data: users = [], isLoading, error, refetch } = useUsers({
    page: pagination.page,
    limit: PAGE_SIZE,
  });
  const deleteUser = useDeleteUser();
  const toast = useToast();
  const confirm = useConfirm();
  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    const searchedUsers = !q
      ? users
      : users.filter((u) =>
          [
            u.fullName,
            u.username,
            u.email,
            u.phoneNumber ?? "",
            u.jobTitle ?? "",
            u.status ?? "",
            String(u.id),
          ]
            .join(" ")
            .toLowerCase()
            .includes(q),
        );

    if (selectedJobTitle === "__all__") return searchedUsers;
    return searchedUsers.filter(
      (u) => (u.jobTitle ?? "__unassigned__") === selectedJobTitle,
    );
  }, [users, search, selectedJobTitle]);

  const jobTitleOptions = useMemo(() => {
    const titles = new Set<string>();
    users.forEach((u) => {
      const value = (u.jobTitle ?? "").trim();
      if (value) titles.add(value);
    });
    return Array.from(titles).sort((a, b) => a.localeCompare(b));
  }, [users]);

  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [searchInput]);

  useEffect(() => {
    pagination.observePageResult(filteredUsers.length);
  }, [filteredUsers.length, pagination]);

  useEffect(() => {
    pagination.reset(1);
  }, [search, pagination]);

  useEffect(() => {
    pagination.reset(1);
  }, [selectedJobTitle, pagination]);

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

  const columns = useMemo(
    () =>
      getUserTableColumns({
        onView: (u) => router.push(`/users/${u.id}`),
      }),
    [router],
  );

  async function handleDeleteSelected(items: AppUser[]) {
    if (items.length === 0) return;
    const ok = await confirm({
      title: "Delete users",
      description: `Delete ${items.length} selected user(s)? This cannot be undone.`,
      confirmLabel: "Delete",
      variant: "destructive",
    });
    if (!ok) return;
    try {
      for (const item of items) {
        await deleteUser.mutateAsync(item.id);
      }
      toast.success(`${items.length} user(s) deleted.`);
    } catch {
      toast.error("Failed to delete some users.");
    }
  }

  return (
    <EntityListWithCreateModal<AppUser>
      data={filteredUsers}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      loadingText="Loading users..."
      emptyText={
        search.trim()
          ? "No users match your search."
          : selectedJobTitle !== "__all__"
            ? "No users match this job type."
            : "No users yet."
      }
      topContent={
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search users..."
            className="sm:w-[360px]"
          />
          <Select value={selectedJobTitle} onValueChange={setSelectedJobTitle}>
            <SelectTrigger className="sm:w-[240px]">
              <SelectValue placeholder="Filter by job type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All job types</SelectItem>
              {jobTitleOptions.map((title) => (
                <SelectItem key={title} value={title}>
                  {title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      }
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
      enableRowSelection
      onEditSelected={(item) => router.push(`/users/${item.id}/edit`)}
      onDeleteSelected={handleDeleteSelected}
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
