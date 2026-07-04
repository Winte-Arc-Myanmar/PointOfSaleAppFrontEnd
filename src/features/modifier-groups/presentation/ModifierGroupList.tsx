"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/presentation/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { useToast } from "@/presentation/providers/ToastProvider";
import { usePagination } from "@/presentation/hooks/usePagination";
import {
  useDeleteModifierGroup,
  useModifierGroups,
} from "@/presentation/hooks/useModifierGroups";
import type { ModifierGroup } from "@/core/domain/entities/ModifierGroup";
import { CreateModifierGroupForm } from "./CreateModifierGroupForm";
import { getModifierGroupRowActions } from "./modifier-group-row-actions";
import { getModifierGroupTableColumns } from "./modifier-group-table-columns";

const CREATE_FORM_ID = "create-modifier-group-form";
const SEARCH_DEBOUNCE_MS = 300;
const PAGE_SIZE = 10;
const ALL = "__all__";

export function ModifierGroupList() {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const del = useDeleteModifierGroup();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [requiredFilter, setRequiredFilter] = useState(ALL);
  const pagination = usePagination({ pageSize: PAGE_SIZE });

  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [searchInput]);

  useEffect(() => {
    pagination.reset(1);
  }, [search, requiredFilter, pagination.reset]);

  const { data: groupsResult, isLoading, error, refetch } = useModifierGroups({
    search: search || undefined,
    page: pagination.page,
    limit: PAGE_SIZE,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const groups = groupsResult?.items ?? [];
  const filteredGroups = useMemo(
    () =>
      requiredFilter === ALL
        ? groups
        : groups.filter((g) => (requiredFilter === "REQUIRED" ? g.isRequired : !g.isRequired)),
    [groups, requiredFilter],
  );

  const actions = useMemo(
    () =>
      getModifierGroupRowActions({
        onView: (group) => router.push(`/modifier-groups/${group.id}`),
        onEdit: (group) => router.push(`/modifier-groups/${group.id}/edit`),
        onDelete: async (group) => {
          const ok = await confirm({
            title: "Delete modifier group",
            description: `Delete "${group.name}"? This cannot be undone.`,
            confirmLabel: "Delete",
            variant: "destructive",
          });
          if (ok) {
            del.mutate(String(group.id), {
              onSuccess: () => toast.success("Modifier group deleted."),
              onError: () => toast.error("Failed to delete modifier group."),
            });
          }
        },
      }),
    [router, confirm, del, toast],
  );

  const columns = useMemo(
    () =>
      getModifierGroupTableColumns({
        onView: (group) => router.push(`/modifier-groups/${group.id}`),
      }),
    [router],
  );

  return (
    <EntityListWithCreateModal<ModifierGroup>
      data={filteredGroups}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      loadingText="Loading modifier groups..."
      emptyText={search ? "No modifier groups match your search." : "No modifier groups yet."}
      error={
        error
          ? {
              message: "Failed to load modifier groups.",
              onRetry: () => refetch(),
            }
          : undefined
      }
      topContent={
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search modifier groups..."
          />
          <Select value={requiredFilter} onValueChange={setRequiredFilter}>
            <SelectTrigger className="sm:w-[200px]">
              <SelectValue placeholder="Filter required" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All groups</SelectItem>
              <SelectItem value="REQUIRED">Required only</SelectItem>
              <SelectItem value="OPTIONAL">Optional only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      }
      pageSize={PAGE_SIZE}
      currentPage={pagination.page}
      totalPages={groupsResult?.totalPages ?? pagination.getTotalPages(groupsResult?.total)}
      totalItems={groupsResult?.total ?? 0}
      onPageChange={pagination.setPage}
      addLabel="New Modifier Group"
      createTitle="Create Modifier Group"
      createSubmitText="Create Group"
      createLoadingText="Creating..."
      createFormId={CREATE_FORM_ID}
      createMaxWidth="2xl"
      renderCreateForm={({ formId, onSuccess, onLoadingChange }) => (
        <CreateModifierGroupForm
          formId={formId}
          onSuccess={onSuccess}
          onLoadingChange={onLoadingChange}
        />
      )}
    />
  );
}
