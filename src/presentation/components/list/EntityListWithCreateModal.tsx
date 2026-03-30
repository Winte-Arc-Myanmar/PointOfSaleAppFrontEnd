"use client";

import { useState, type ReactNode } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { DataTable, type DataTableAction, type DataTableColumn } from "@/presentation/components/data-table";
import { FormModal } from "@/presentation/components/modal/FormModal";

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
  addLabel: string;
  createTitle: string;
  createSubmitText: string;
  createLoadingText: string;
  createFormId: string;
  createMaxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
  renderCreateForm: (args: CreateFormRenderArgs) => ReactNode;
  sectionTitle?: string;
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
  addLabel,
  createTitle,
  createSubmitText,
  createLoadingText,
  createFormId,
  createMaxWidth = "md",
  renderCreateForm,
  sectionTitle,
}: EntityListWithCreateModalProps<T>) {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createFormLoading, setCreateFormLoading] = useState(false);

  const content = (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {addLabel}
        </Button>
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
