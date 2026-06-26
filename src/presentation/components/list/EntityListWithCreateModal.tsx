"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/presentation/components/ui/button";
import {
  DataTable,
  type DataTableAction,
  type DataTableColumn,
  type DataTableViewMode,
} from "@/presentation/components/data-table";
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
  /** When false, hides the Add button and create modal. Create props are ignored. */
  createEnabled?: boolean;
  addLabel?: string;
  createTitle?: string;
  createSubmitText?: string;
  createLoadingText?: string;
  createFormId?: string;
  createMaxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
  renderCreateForm?: (args: CreateFormRenderArgs) => ReactNode;
  sectionTitle?: string;
  enableRowSelection?: boolean;
  onEditSelected?: (item: T) => void;
  onDeleteSelected?: (items: T[]) => void;
  /** When false, hides the default action toolbar row. */
  showActionBar?: boolean;
  /** Custom content on the right side of the action toolbar (e.g. upload buttons). */
  toolbarEndContent?: ReactNode;
  /** Page-level header above filters (receives openCreate for wiring Add buttons). */
  renderPageHeader?: (helpers: { openCreate: () => void }) => ReactNode;
  /** Renders beside the table in a split layout (e.g. category tree). */
  sidebarContent?: ReactNode;
  /** Header inside the table panel card. */
  tablePanelHeader?: ReactNode;
  tableContentClassName?: string;
  rootClassName?: string;
  tablePanelClassName?: string;
  splitLayoutClassName?: string;
  /** DataTable grid / shortcut action passthrough */
  enableGridView?: boolean;
  defaultViewMode?: DataTableViewMode;
  renderGridItem?: (item: T) => ReactNode;
  gridClassName?: string;
  gridCardClassName?: string;
  onView?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
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
  createEnabled = true,
  addLabel = "Add",
  createTitle = "Create",
  createSubmitText = "Create",
  createLoadingText = "Creating...",
  createFormId = "create-entity-form",
  createMaxWidth = "md",
  renderCreateForm,
  sectionTitle,
  enableRowSelection = false,
  onEditSelected,
  onDeleteSelected,
  showActionBar = true,
  toolbarEndContent,
  renderPageHeader,
  sidebarContent,
  tablePanelHeader,
  tableContentClassName,
  rootClassName,
  tablePanelClassName,
  splitLayoutClassName = "grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]",
  enableGridView,
  defaultViewMode,
  renderGridItem,
  gridClassName,
  gridCardClassName,
  onView,
  onEdit,
  onDelete,
}: EntityListWithCreateModalProps<T>) {
  const { t } = useLanguage();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createFormLoading, setCreateFormLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const openCreate = () => setCreateModalOpen(true);

  const selectedItems = useMemo(
    () => data.filter((item) => selectedIds.has(String(item.id))),
    [data, selectedIds],
  );
  const hasSelection = selectedItems.length > 0;
  const canEditSelected = selectedItems.length === 1 && !!onEditSelected;
  const canDeleteSelected = selectedItems.length > 0 && !!onDeleteSelected;

  const actionBar =
    showActionBar &&
    (createEnabled || toolbarEndContent || (enableRowSelection && hasSelection)) ? (
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
          {toolbarEndContent}
          {createEnabled && (
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              {addLabel}
            </Button>
          )}
        </div>
      </div>
    ) : null;

  const dataTable = (
    <DataTable<T>
      data={data}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      loadingText={loadingText}
      emptyText={emptyText}
      emptyAction={
        createEnabled
          ? {
              label: addLabel,
              onClick: openCreate,
            }
          : undefined
      }
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
      enableGridView={enableGridView}
      defaultViewMode={defaultViewMode}
      renderGridItem={renderGridItem}
      gridClassName={gridClassName}
      gridCardClassName={gridCardClassName}
      onView={onView}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );

  const createModal =
    createEnabled && renderCreateForm ? (
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
    ) : null;

  const tableBody = (
    <div className={tableContentClassName}>
      {actionBar}
      {dataTable}
      {createModal}
    </div>
  );

  const tableSection = (
    <>
      {tablePanelHeader}
      {tableBody}
    </>
  );

  const body = (
    <>
      {renderPageHeader?.({ openCreate })}
      {showTopContent && topContent}
      {sidebarContent ? (
        <div className={splitLayoutClassName}>
          <div className="min-w-0">{sidebarContent}</div>
          <div className={cn("min-w-0", tablePanelClassName)}>{tableSection}</div>
        </div>
      ) : (
        <div className={tablePanelClassName}>{tableSection}</div>
      )}
    </>
  );

  const wrappedBody = rootClassName ? (
    <div className={rootClassName}>{body}</div>
  ) : (
    body
  );

  if (!sectionTitle) return wrappedBody;

  return (
    <section>
      <h2 className="section-label mb-4">{sectionTitle}</h2>
      {wrappedBody}
    </section>
  );
}
