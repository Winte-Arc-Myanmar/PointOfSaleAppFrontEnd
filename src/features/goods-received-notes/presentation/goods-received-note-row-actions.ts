import type { DataTableAction } from "@/presentation/components/data-table";
import type { GoodsReceivedNote } from "@/core/domain/entities/GoodsReceivedNote";

export interface GoodsReceivedNoteRowActionsConfig {
  onView?: (row: GoodsReceivedNote) => void;
  onEdit?: (row: GoodsReceivedNote) => void;
  onDelete?: (row: GoodsReceivedNote) => void;
}

export function getGoodsReceivedNoteRowActions(
  config: GoodsReceivedNoteRowActionsConfig
): DataTableAction<GoodsReceivedNote>[] {
  const actions: DataTableAction<GoodsReceivedNote>[] = [];
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
