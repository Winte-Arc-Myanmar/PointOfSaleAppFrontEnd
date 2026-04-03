"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ScrollText } from "lucide-react";
import {
  useInventoryLedger,
  useInventoryLedgerExpiring,
  useDeleteInventoryLedgerEntry,
} from "@/presentation/hooks/useInventoryLedger";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { FormModal } from "@/presentation/components/modal/FormModal";
import { getInventoryLedgerRowActions } from "./inventory-ledger-row-actions";
import { getInventoryLedgerTableColumns } from "./inventory-ledger-table-columns";
import { CreateInventoryLedgerForm } from "./CreateInventoryLedgerForm";
import { WriteOffInventoryForm } from "./WriteOffInventoryForm";
import { InventoryBalancePanel } from "./InventoryBalancePanel";
import type { InventoryLedgerEntry } from "@/core/domain/entities/InventoryLedgerEntry";
import { cn } from "@/lib/utils";

const CREATE_FORM_ID = "create-inventory-ledger-form";
const WRITE_OFF_FORM_ID = "write-off-inventory-form";

type View = "all" | "expiring" | "balance";

const VIEW_TABS: readonly (readonly [View, string])[] = [
  ["all", "All entries"],
  ["expiring", "Expiring"],
  ["balance", "Balance lookup"],
];

export function InventoryLedgerList() {
  const router = useRouter();
  const [view, setView] = useState<View>("all");
  const [expiringDays, setExpiringDays] = useState(30);
  const [writeOffOpen, setWriteOffOpen] = useState(false);
  const [writeOffLoading, setWriteOffLoading] = useState(false);

  const {
    data: allRows = [],
    isLoading: allLoading,
    error: allError,
    refetch: refetchAll,
  } = useInventoryLedger({ page: 1, limit: 50 }, { enabled: view === "all" });

  const {
    data: expiringRows = [],
    isLoading: expiringLoading,
    error: expiringError,
    refetch: refetchExpiring,
  } = useInventoryLedgerExpiring(
    { page: 1, limit: 50, days: expiringDays },
    { enabled: view === "expiring" }
  );

  const deleteEntry = useDeleteInventoryLedgerEntry();
  const toast = useToast();
  const confirm = useConfirm();

  const data: InventoryLedgerEntry[] =
    view === "expiring" ? expiringRows : view === "all" ? allRows : [];
  const isLoading =
    view === "expiring" ? expiringLoading : view === "all" ? allLoading : false;
  const error = view === "expiring" ? expiringError : view === "all" ? allError : null;
  const refetch = view === "expiring" ? refetchExpiring : refetchAll;

  const actions = useMemo(
    () =>
      getInventoryLedgerRowActions({
        onView: (r) => router.push(`/inventory-ledger/${r.id}`),
        onDelete: async (r) => {
          const ok = await confirm({
            title: "Delete ledger entry",
            description:
              "Delete this ledger line? This may not be allowed if the API blocks it.",
            confirmLabel: "Delete",
            variant: "destructive",
          });
          if (ok) {
            deleteEntry.mutate(r.id, {
              onSuccess: () => toast.success("Entry deleted."),
              onError: () => toast.error("Failed to delete entry."),
            });
          }
        },
      }),
    [router, deleteEntry, toast, confirm]
  );

  const columns = useMemo(() => getInventoryLedgerTableColumns(), []);

  const expiringFilter =
    view === "expiring" ? (
      <div className="flex flex-wrap items-end gap-3">
        <div className="grid gap-2 w-32">
          <Label htmlFor="exp-days">Days ahead</Label>
          <Input
            id="exp-days"
            type="number"
            min={1}
            max={3650}
            value={expiringDays}
            onChange={(e) => setExpiringDays(Number(e.target.value) || 30)}
          />
        </div>
        <p className="text-sm text-muted pb-2">
          Shows items expiring within the selected number of days.
        </p>
      </div>
    ) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div
          className="inline-flex rounded-lg border border-border bg-muted/20 p-1"
          role="tablist"
        >
          {VIEW_TABS.map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={view === key}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                view === key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted hover:text-foreground"
              )}
              onClick={() => setView(key)}
            >
              {label}
            </button>
          ))}
        </div>
        <Button variant="outline" onClick={() => setWriteOffOpen(true)}>
          <ScrollText className="mr-2 size-4" />
          Write off
        </Button>
      </div>

      {view === "balance" ? (
        <InventoryBalancePanel />
      ) : (
        <EntityListWithCreateModal<InventoryLedgerEntry>
          data={data}
          columns={columns}
          actions={actions}
          isLoading={isLoading}
          loadingText="Loading ledger…"
          emptyText="No entries in this view."
          error={
            error
              ? {
                  message: "Failed to load ledger.",
                  onRetry: () => refetch(),
                }
              : undefined
          }
          pageSize={10}
          showTopContent={view === "expiring"}
          topContent={expiringFilter}
          addLabel="New entry"
          createTitle="New inventory ledger entry"
          createSubmitText="Create entry"
          createLoadingText="Saving…"
          createFormId={CREATE_FORM_ID}
          createMaxWidth="2xl"
          renderCreateForm={({ formId, onSuccess, onLoadingChange }) => (
            <CreateInventoryLedgerForm
              formId={formId}
              onSuccess={onSuccess}
              onLoadingChange={onLoadingChange}
            />
          )}
        />
      )}

      <FormModal
        isOpen={writeOffOpen}
        onClose={() => setWriteOffOpen(false)}
        title="Write off stock"
        formId={WRITE_OFF_FORM_ID}
        formContent={
          <WriteOffInventoryForm
            formId={WRITE_OFF_FORM_ID}
            onLoadingChange={setWriteOffLoading}
            onSuccess={() => setWriteOffOpen(false)}
          />
        }
        submitText="Submit write-off"
        loadingText="Submitting…"
        isLoading={writeOffLoading}
        maxWidth="lg"
      />
    </div>
  );
}
