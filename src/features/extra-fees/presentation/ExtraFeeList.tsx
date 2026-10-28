"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import type { DataTableAction, DataTableColumn } from "@/presentation/components/data-table";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useDeleteExtraFee, useExtraFees, useUpdateExtraFee } from "@/presentation/hooks/useExtraFees";
import type { ExtraFee } from "@/core/domain/entities/ExtraFee";
import { apiErrorMessage } from "@/lib/api-error";
import { formatMoney } from "@/lib/money";
import { CreateExtraFeeForm } from "./CreateExtraFeeForm";

export function ExtraFeeList() {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const del = useDeleteExtraFee();
  const update = useUpdateExtraFee();
  const { data: fees = [], isLoading, error, refetch } = useExtraFees();

  const columns = useMemo<DataTableColumn<ExtraFee>[]>(
    () => [
      {
        key: "name",
        header: "Name",
        render: (f) =>
          f.isOther ? (
            <span className="font-medium">{f.name}</span>
          ) : (
            <button
              type="button"
              className="text-left font-medium hover:text-mint"
              onClick={() => router.push(`/extra-fees/${f.id}/edit`)}
            >
              {f.name}
            </button>
          ),
      },
      {
        key: "amount",
        header: "Amount",
        render: (f) => (
          <span className="tabular-nums text-sm text-muted">
            {f.isOther ? "Cashier types it" : formatMoney(f.amount)}
          </span>
        ),
      },
      {
        key: "isActive",
        header: "At the till",
        render: (f) =>
          f.isActive ? (
            <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
              On
            </span>
          ) : (
            <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">Off</span>
          ),
      },
    ],
    [router],
  );

  const actions = useMemo<DataTableAction<ExtraFee>[]>(
    () => [
      {
        label: "Edit",
        onClick: (f) => router.push(`/extra-fees/${f.id}/edit`),
        disabled: (f) => f.isOther,
      },
      {
        label: "Turn on / off",
        onClick: (f) =>
          update.mutate(
            { id: f.id, data: { isActive: !f.isActive } },
            {
              onSuccess: () => toast.success(`${f.name} turned ${f.isActive ? "off" : "on"}.`),
              onError: (err) => toast.error(apiErrorMessage(err, "Couldn't change it.")),
            },
          ),
      },
      {
        label: "Remove",
        variant: "destructive",
        disabled: (f) => f.isOther,
        onClick: async (f) => {
          const ok = await confirm({
            title: "Remove fee",
            description: `Remove ${f.name}? Past bills and reports keep it.`,
            confirmLabel: "Remove",
            variant: "destructive",
          });
          if (ok) {
            del.mutate(f.id, {
              onSuccess: () => toast.success(`${f.name} removed.`),
              onError: (err) => toast.error(apiErrorMessage(err, "Couldn't remove the fee.")),
            });
          }
        },
      },
    ],
    [router, confirm, del, update, toast],
  );

  return (
    <EntityListWithCreateModal<ExtraFee>
      data={fees}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      loadingText="Loading extra fees..."
      emptyText="No extra fees yet. Add the first one, such as a plastic container."
      error={error ? { message: apiErrorMessage(error, "Failed to load extra fees."), onRetry: () => refetch() } : undefined}
      addLabel="Add fee"
      createTitle="Add an extra fee"
      createSubmitText="Add fee"
      createLoadingText="Adding..."
      createFormId="create-extra-fee-form"
      createMaxWidth="2xl"
      renderCreateForm={({ formId, onSuccess, onLoadingChange }) => (
        <CreateExtraFeeForm formId={formId} onSuccess={onSuccess} onLoadingChange={onLoadingChange} />
      )}
    />
  );
}
