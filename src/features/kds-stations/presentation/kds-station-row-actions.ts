import type { DataTableAction } from "@/presentation/components/data-table";
import type { KdsStation } from "@/core/domain/entities/KdsStation";

export interface KdsStationRowActionsConfig {
  onView?: (row: KdsStation) => void;
  onEdit?: (row: KdsStation) => void;
  onDelete?: (row: KdsStation) => void;
}

export function getKdsStationRowActions(
  config: KdsStationRowActionsConfig,
): DataTableAction<KdsStation>[] {
  const actions: DataTableAction<KdsStation>[] = [];
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
