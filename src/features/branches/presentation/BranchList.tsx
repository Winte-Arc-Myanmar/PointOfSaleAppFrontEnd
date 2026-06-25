"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useBranches, useDeleteBranch } from "@/presentation/hooks/useBranches";
import { usePagination } from "@/presentation/hooks/usePagination";
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
import { getBranchRowActions } from "./branch-row-actions";
import { getBranchTableColumns } from "./branch-table-columns";
import { CreateBranchForm } from "./CreateBranchForm";
import type { Branch } from "@/core/domain/entities/Branch";

const CREATE_BRANCH_FORM_ID = "create-branch-form";
const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

export function BranchList() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("__all__");
  const pagination = usePagination({ pageSize: PAGE_SIZE });
  const { data: branchesResult, isLoading, error, refetch } = useBranches({
    page: pagination.page,
    limit: PAGE_SIZE,
  });
  const branches = branchesResult?.items ?? [];
  const deleteBranch = useDeleteBranch();
  const toast = useToast();
  const confirm = useConfirm();
  const filteredBranches = useMemo(() => {
    const q = search.trim().toLowerCase();
    const searched = !q
      ? branches
      : branches.filter((b) =>
      [
        b.name,
        b.branchCode,
        b.type,
        b.email,
        b.phone,
        b.city,
        b.state,
        b.country,
        b.address,
        String(b.id),
      ]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
    if (selectedType === "__all__") return searched;
    return searched.filter((b) => (b.type?.trim() || "__none__") === selectedType);
  }, [branches, search, selectedType]);

  const typeOptions = useMemo(() => {
    const types = new Set<string>();
    branches.forEach((b) => {
      const value = (b.type ?? "").trim();
      if (value) types.add(value);
    });
    return Array.from(types).sort((a, b) => a.localeCompare(b));
  }, [branches]);

  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [searchInput]);

  useEffect(() => {
    pagination.reset(1);
  }, [search, pagination.reset]);

  useEffect(() => {
    pagination.reset(1);
  }, [selectedType, pagination.reset]);

  const actions = useMemo(
    () =>
      getBranchRowActions({
        onView: (b) => router.push(`/branches/${b.id}`),
        onEdit: (b) => router.push(`/branches/${b.id}/edit`),
        onDelete: async (b) => {
          const ok = await confirm({
            title: "Delete branch",
            description: `Delete "${b.name}"? This cannot be undone.`,
            confirmLabel: "Delete",
            variant: "destructive",
          });
          if (ok) {
            deleteBranch.mutate(b.id, {
              onSuccess: () => toast.success("Branch deleted."),
              onError: () => toast.error("Failed to delete branch."),
            });
          }
        },
      }),
    [router, deleteBranch, toast, confirm]
  );

  const columns = useMemo(
    () =>
      getBranchTableColumns({
        onView: (b) => router.push(`/branches/${b.id}`),
      }),
    [router],
  );

  async function handleDeleteSelected(items: Branch[]) {
    if (items.length === 0) return;
    const ok = await confirm({
      title: "Delete branches",
      description: `Delete ${items.length} selected branch(es)? This cannot be undone.`,
      confirmLabel: "Delete",
      variant: "destructive",
    });
    if (!ok) return;
    try {
      for (const item of items) {
        await deleteBranch.mutateAsync(item.id);
      }
      toast.success(`${items.length} branch(es) deleted.`);
    } catch {
      toast.error("Failed to delete some branches.");
    }
  }

  return (
    <EntityListWithCreateModal<Branch>
      data={filteredBranches}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      loadingText="Loading branches..."
      emptyText={
        search.trim()
          ? "No branches match your search."
          : selectedType !== "__all__"
            ? "No branches match this type."
            : "No branches yet."
      }
      topContent={
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search branches..."
            className="sm:w-[360px]"
          />
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="sm:w-[220px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All types</SelectItem>
              {typeOptions.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      }
      error={
        error
          ? {
              message: "Failed to load branches.",
              onRetry: () => refetch(),
            }
          : undefined
      }
      pageSize={PAGE_SIZE}
      currentPage={pagination.page}
      totalPages={pagination.getTotalPages(branchesResult?.total)}
      totalItems={branchesResult?.total ?? 0}
      onPageChange={pagination.setPage}
      addLabel="Add Branch"
      createTitle="Create Branch"
      createSubmitText="Create Branch"
      createLoadingText="Creating..."
      createFormId={CREATE_BRANCH_FORM_ID}
      createMaxWidth="2xl"
      enableRowSelection
      onEditSelected={(item) => router.push(`/branches/${item.id}/edit`)}
      onDeleteSelected={handleDeleteSelected}
      renderCreateForm={({ formId, onSuccess, onLoadingChange }) => (
        <CreateBranchForm
          formId={formId}
          onSuccess={onSuccess}
          onLoadingChange={onLoadingChange}
        />
      )}
    />
  );
}
