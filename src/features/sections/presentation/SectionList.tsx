"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { useToast } from "@/presentation/providers/ToastProvider";
import { Input } from "@/presentation/components/ui/input";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import { useDeleteSection, useSections } from "@/presentation/hooks/useSections";
import { usePagination } from "@/presentation/hooks/usePagination";
import type { Section } from "@/core/domain/entities/Section";
import { CreateSectionForm } from "./CreateSectionForm";
import { getSectionRowActions } from "./section-row-actions";
import { getSectionTableColumns } from "./section-table-columns";

const CREATE_SECTION_FORM_ID = "create-section-form";
const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

export function SectionList() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const pagination = usePagination({ pageSize: PAGE_SIZE });
  const { data: sectionsResult, isLoading, error, refetch } = useSections({
    page: pagination.page,
    limit: PAGE_SIZE,
    search: search || undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const sections = sectionsResult?.items ?? [];
  const remove = useDeleteSection();
  const toast = useToast();
  const confirm = useConfirm();

  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [searchInput]);

  useEffect(() => {
    pagination.reset(1);
  }, [search, pagination.reset]);

  const actions = useMemo(
    () =>
      getSectionRowActions({
        onView: (section) => router.push(`/sections/${section.id}`),
        onEdit: (section) => router.push(`/sections/${section.id}/edit`),
        onDelete: async (section) => {
          const ok = await confirm({
            title: "Delete section",
            description: `Delete "${section.name}"? This cannot be undone.`,
            confirmLabel: "Delete",
            variant: "destructive",
          });
          if (ok) {
            remove.mutate(String(section.id), {
              onSuccess: () => toast.success("Section deleted."),
              onError: () => toast.error("Failed to delete section."),
            });
          }
        },
      }),
    [router, confirm, remove, toast]
  );

  const columns = useMemo(
    () =>
      getSectionTableColumns({
        onView: (section) => router.push(`/sections/${section.id}`),
      }),
    [router]
  );

  async function handleDeleteSelected(items: Section[]) {
    if (items.length === 0) return;
    const ok = await confirm({
      title: "Delete sections",
      description: `Delete ${items.length} selected section(s)? This cannot be undone.`,
      confirmLabel: "Delete",
      variant: "destructive",
    });
    if (!ok) return;
    try {
      for (const item of items) {
        await remove.mutateAsync(String(item.id));
      }
      toast.success(`${items.length} section(s) deleted.`);
    } catch {
      toast.error("Failed to delete some sections.");
    }
  }

  return (
    <EntityListWithCreateModal<Section>
      data={sections}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      loadingText="Loading sections..."
      emptyText={search ? "No sections match your search." : "No sections yet."}
      topContent={
        <div className="mb-4">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search sections..."
            className="sm:w-[360px]"
          />
        </div>
      }
      error={
        error
          ? {
              message: "Failed to load sections.",
              onRetry: () => refetch(),
            }
          : undefined
      }
      pageSize={PAGE_SIZE}
      currentPage={pagination.page}
      totalPages={sectionsResult?.totalPages ?? pagination.getTotalPages(sectionsResult?.total)}
      totalItems={sectionsResult?.total ?? 0}
      onPageChange={pagination.setPage}
      addLabel="Add Section"
      createTitle="Create Section"
      createSubmitText="Create Section"
      createLoadingText="Creating..."
      createFormId={CREATE_SECTION_FORM_ID}
      createMaxWidth="2xl"
      enableRowSelection
      onEditSelected={(item) => router.push(`/sections/${item.id}/edit`)}
      onDeleteSelected={handleDeleteSelected}
      renderCreateForm={({ formId, onSuccess, onLoadingChange }) => (
        <CreateSectionForm
          formId={formId}
          onSuccess={onSuccess}
          onLoadingChange={onLoadingChange}
        />
      )}
    />
  );
}
