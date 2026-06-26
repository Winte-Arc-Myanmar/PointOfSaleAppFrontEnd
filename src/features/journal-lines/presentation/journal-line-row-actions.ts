import type { DataTableAction } from "@/presentation/components/data-table";
import type { JournalLine } from "@/core/domain/entities/JournalLine";

export interface JournalLineRowActionsConfig {
  onView?: (row: JournalLine) => void;
  onEdit?: (row: JournalLine) => void;
  onDelete?: (row: JournalLine) => void;
}

export function getJournalLineRowActions(
  config: JournalLineRowActionsConfig
): DataTableAction<JournalLine>[] {
  const actions: DataTableAction<JournalLine>[] = [];
  if (config.onView) actions.push({ label: "View", onClick: config.onView });
  if (config.onEdit) actions.push({ label: "Edit", onClick: config.onEdit });
  if (config.onDelete) {
    actions.push({
      label: "Delete",
      onClick: config.onDelete,
      variant: "destructive",
    });
  }
  return actions;
}
