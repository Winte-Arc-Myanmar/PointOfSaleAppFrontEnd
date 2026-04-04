"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { useToast } from "@/presentation/providers/ToastProvider";
import { EntityListWithCreateModal } from "@/presentation/components/list/EntityListWithCreateModal";
import {
  useCustomerInteractions,
  useDeleteCustomerInteraction,
} from "@/presentation/hooks/useCustomerInteractions";
import type { CustomerInteraction } from "@/core/domain/entities/CustomerInteraction";
import { CreateCustomerInteractionForm } from "./CreateCustomerInteractionForm";
import { getCustomerInteractionRowActions } from "./customer-interaction-row-actions";
import { getCustomerInteractionTableColumns } from "./customer-interaction-table-columns";

const CREATE_FORM_ID = "create-customer-interaction-form";

export interface CustomerInteractionListProps {
  customerId: string;
  /**
   * Base URL for list/detail/edit (no trailing slash).
   * Default: `/customers/:customerId/interactions`
   */
  routeBasePath?: string;
}

export function CustomerInteractionList({
  customerId,
  routeBasePath,
}: CustomerInteractionListProps) {
  const router = useRouter();
  const { data: rows = [], isLoading, error, refetch } =
    useCustomerInteractions(customerId);
  const deleteInteraction = useDeleteCustomerInteraction();
  const toast = useToast();
  const confirm = useConfirm();

  const basePath =
    routeBasePath ?? `/customers/${customerId}/interactions`;

  const actions = useMemo(
    () =>
      getCustomerInteractionRowActions({
        onView: (row) => router.push(`${basePath}/${row.id}`),
        onEdit: (row) => router.push(`${basePath}/${row.id}/edit`),
        onDelete: async (row) => {
          const ok = await confirm({
            title: "Delete interaction",
            description: `Delete this ${row.interactionType} interaction? This cannot be undone.`,
            confirmLabel: "Delete",
            variant: "destructive",
          });
          if (ok) {
            deleteInteraction.mutate(
              { customerId, interactionId: String(row.id) },
              {
                onSuccess: () => toast.success("Interaction deleted."),
                onError: () => toast.error("Failed to delete interaction."),
              }
            );
          }
        },
      }),
    [router, customerId, deleteInteraction, toast, confirm, basePath]
  );

  const columns = useMemo(() => getCustomerInteractionTableColumns(), []);

  return (
    <EntityListWithCreateModal<CustomerInteraction>
      data={rows}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      loadingText="Loading interactions..."
      emptyText="No interactions yet."
      error={
        error
          ? {
              message: "Failed to load interactions.",
              onRetry: () => refetch(),
            }
          : undefined
      }
      pageSize={10}
      addLabel="Add interaction"
      createTitle="Log customer interaction"
      createSubmitText="Create interaction"
      createLoadingText="Creating..."
      createFormId={CREATE_FORM_ID}
      createMaxWidth="lg"
      renderCreateForm={({ formId, onSuccess, onLoadingChange }) => (
        <CreateCustomerInteractionForm
          customerId={customerId}
          formId={formId}
          onSuccess={onSuccess}
          onLoadingChange={onLoadingChange}
        />
      )}
    />
  );
}
