import type { DataTableAction } from "@/presentation/components/data-table";
import type { FixedAsset } from "@/core/domain/entities/FixedAsset";

export interface FixedAssetRowActionsConfig {
  onView?: (row: FixedAsset) => void;
  onEdit?: (row: FixedAsset) => void;
  onDelete?: (row: FixedAsset) => void;
}

export function getFixedAssetRowActions(
  config: FixedAssetRowActionsConfig
): DataTableAction<FixedAsset>[] {
  const actions: DataTableAction<FixedAsset>[] = [];
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
