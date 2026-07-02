"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { useToast } from "@/presentation/providers/ToastProvider";
import { Input } from "@/presentation/components/ui/input";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import {
  useDeleteKitchenPrinter,
  useKitchenPrinters,
} from "@/presentation/hooks/useKitchenPrinters";
import { usePagination } from "@/presentation/hooks/usePagination";
import type { KitchenPrinter } from "@/core/domain/entities/KitchenPrinter";
import { CreateKitchenPrinterForm } from "./CreateKitchenPrinterForm";
import { getKitchenPrinterRowActions } from "./kitchen-printer-row-actions";
import { getKitchenPrinterTableColumns } from "./kitchen-printer-table-columns";

const CREATE_KITCHEN_PRINTER_FORM_ID = "create-kitchen-printer-form";
const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

export function KitchenPrinterList() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const pagination = usePagination({ pageSize: PAGE_SIZE });
  const { data: printersResult, isLoading, error, refetch } = useKitchenPrinters({
    page: pagination.page,
    limit: PAGE_SIZE,
    search: search || undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const printers = printersResult?.items ?? [];
  const remove = useDeleteKitchenPrinter();
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
      getKitchenPrinterRowActions({
        onView: (printer) => router.push(`/kitchen-printers/${printer.id}`),
        onEdit: (printer) => router.push(`/kitchen-printers/${printer.id}/edit`),
        onDelete: async (printer) => {
          const ok = await confirm({
            title: "Delete kitchen printer",
            description: `Delete "${printer.name}"? This cannot be undone.`,
            confirmLabel: "Delete",
            variant: "destructive",
          });
          if (ok) {
            remove.mutate(String(printer.id), {
              onSuccess: () => toast.success("Kitchen printer deleted."),
              onError: () => toast.error("Failed to delete kitchen printer."),
            });
          }
        },
      }),
    [router, confirm, remove, toast]
  );

  const columns = useMemo(
    () =>
      getKitchenPrinterTableColumns({
        onView: (printer) => router.push(`/kitchen-printers/${printer.id}`),
      }),
    [router]
  );

  async function handleDeleteSelected(items: KitchenPrinter[]) {
    if (items.length === 0) return;
    const ok = await confirm({
      title: "Delete kitchen printers",
      description: `Delete ${items.length} selected printer(s)? This cannot be undone.`,
      confirmLabel: "Delete",
      variant: "destructive",
    });
    if (!ok) return;
    try {
      for (const item of items) {
        await remove.mutateAsync(String(item.id));
      }
      toast.success(`${items.length} kitchen printer(s) deleted.`);
    } catch {
      toast.error("Failed to delete some kitchen printers.");
    }
  }

  return (
    <EntityListWithCreateModal<KitchenPrinter>
      data={printers}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      loadingText="Loading kitchen printers..."
      emptyText={search ? "No kitchen printers match your search." : "No kitchen printers yet."}
      topContent={
        <div className="mb-4">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search kitchen printers..."
            className="sm:w-[360px]"
          />
        </div>
      }
      error={
        error
          ? {
              message: "Failed to load kitchen printers.",
              onRetry: () => refetch(),
            }
          : undefined
      }
      pageSize={PAGE_SIZE}
      currentPage={pagination.page}
      totalPages={printersResult?.totalPages ?? pagination.getTotalPages(printersResult?.total)}
      totalItems={printersResult?.total ?? 0}
      onPageChange={pagination.setPage}
      addLabel="Add Kitchen Printer"
      createTitle="Create Kitchen Printer"
      createSubmitText="Create Kitchen Printer"
      createLoadingText="Creating..."
      createFormId={CREATE_KITCHEN_PRINTER_FORM_ID}
      createMaxWidth="2xl"
      enableRowSelection
      onEditSelected={(item) => router.push(`/kitchen-printers/${item.id}/edit`)}
      onDeleteSelected={handleDeleteSelected}
      renderCreateForm={({ formId, onSuccess, onLoadingChange }) => (
        <CreateKitchenPrinterForm
          formId={formId}
          onSuccess={onSuccess}
          onLoadingChange={onLoadingChange}
        />
      )}
    />
  );
}
