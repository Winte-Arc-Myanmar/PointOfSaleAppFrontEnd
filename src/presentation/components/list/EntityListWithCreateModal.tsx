"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { DataTable, type DataTableAction, type DataTableColumn } from "@/presentation/components/data-table";
import { FormModal } from "@/presentation/components/modal/FormModal";
import { useLanguage } from "@/presentation/providers/LanguageProvider";

interface CreateFormRenderArgs {
  formId: string;
  onSuccess: () => void;
  onLoadingChange: (loading: boolean) => void;
}

interface EntityListWithCreateModalProps<T extends { id: string | number }> {
  data: T[];
  columns: DataTableColumn<T>[];
  actions: DataTableAction<T>[];
  isLoading: boolean;
  loadingText: string;
  emptyText: string;
  error?: { message: string; onRetry?: () => void };
  pageSize?: number;
  /** Server-side pagination (optional). When provided, pagination controls will request pages from the parent. */
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  topContent?: ReactNode;
  showTopContent?: boolean;
  addLabel: string;
  createTitle: string;
  createSubmitText: string;
  createLoadingText: string;
  createFormId: string;
  createMaxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
  renderCreateForm: (args: CreateFormRenderArgs) => ReactNode;
  sectionTitle?: string;
  enableRowSelection?: boolean;
  onEditSelected?: (item: T) => void;
  onDeleteSelected?: (items: T[]) => void;
}

export function EntityListWithCreateModal<T extends { id: string | number }>({
  data,
  columns,
  actions,
  isLoading,
  loadingText,
  emptyText,
  error,
  pageSize = 10,
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  topContent,
  showTopContent = true,
  addLabel,
  createTitle,
  createSubmitText,
  createLoadingText,
  createFormId,
  createMaxWidth = "md",
  renderCreateForm,
  sectionTitle,
  enableRowSelection = false,
  onEditSelected,
  onDeleteSelected,
}: EntityListWithCreateModalProps<T>) {
  const { t } = useLanguage();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createFormLoading, setCreateFormLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const selectedItems = useMemo(
    () => data.filter((item) => selectedIds.has(String(item.id))),
    [data, selectedIds]
  );
  const hasSelection = selectedItems.length > 0;
  const canEditSelected = selectedItems.length === 1 && !!onEditSelected;
  const canDeleteSelected = selectedItems.length > 0 && !!onDeleteSelected;

  const content = (
    <>
      {showTopContent && topContent}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div />
        <div className="flex flex-wrap items-center gap-2">
          {enableRowSelection && onEditSelected && hasSelection && (
            <Button
              variant="secondary"
              disabled={!canEditSelected}
              onClick={() => {
                if (!canEditSelected) return;
                onEditSelected(selectedItems[0]);
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              {t("common.edit")}
            </Button>
          )}
          {enableRowSelection && onDeleteSelected && hasSelection && (
            <Button
              variant="destructive"
              disabled={!canDeleteSelected}
              onClick={() => onDeleteSelected(selectedItems)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {t("common.delete")}
            </Button>
          )}
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {addLabel}
          </Button>
        </div>
      </div>
      <DataTable<T>
        data={data}
        columns={columns}
        actions={actions}
        isLoading={isLoading}
        loadingText={loadingText}
        emptyText={emptyText}
        emptyAction={{
          label: addLabel,
          onClick: () => setCreateModalOpen(true),
        }}
        error={error}
        pageSize={pageSize}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={onPageChange}
        selectable={enableRowSelection}
        allSelected={
          data.length > 0 && data.every((item) => selectedIds.has(String(item.id)))
        }
        onToggleSelectAll={() => {
          if (data.length > 0 && data.every((item) => selectedIds.has(String(item.id)))) {
            setSelectedIds(new Set());
            return;
          }
          setSelectedIds(new Set(data.map((item) => String(item.id))));
        }}
        selectedIds={selectedIds}
        onToggleSelect={(id) => {
          setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
          });
        }}
      />
      <FormModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title={createTitle}
        formId={createFormId}
        formContent={renderCreateForm({
          formId: createFormId,
          onSuccess: () => setCreateModalOpen(false),
          onLoadingChange: setCreateFormLoading,
        })}
        submitText={createSubmitText}
        loadingText={createLoadingText}
        isLoading={createFormLoading}
        maxWidth={createMaxWidth}
      />
    </>
  );

  if (!sectionTitle) return content;

  return (
    <section>
      <h2 className="section-label mb-4">{sectionTitle}</h2>
      {content}
    </section>
  );
}
