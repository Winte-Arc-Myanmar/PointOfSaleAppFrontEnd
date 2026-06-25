import type { DataTableAction } from "@/presentation/components/data-table";
import type { JournalEntry } from "@/core/domain/entities/JournalEntry";

export interface JournalEntryRowActionsConfig {
  onView?: (row: JournalEntry) => void;
  onEdit?: (row: JournalEntry) => void;
  onDelete?: (row: JournalEntry) => void;
}

export function getJournalEntryRowActions(
  config: JournalEntryRowActionsConfig
): DataTableAction<JournalEntry>[] {
  const actions: DataTableAction<JournalEntry>[] = [];
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
