import type { DataTableAction } from "@/presentation/components/data-table";
import type { Location } from "@/core/domain/entities/Location";

export interface LocationRowActionsConfig {
  onView?: (loc: Location) => void;
  onEdit?: (loc: Location) => void;
  onDelete?: (loc: Location) => void;
}

export function getLocationRowActions(
  config: LocationRowActionsConfig
): DataTableAction<Location>[] {
  const actions: DataTableAction<Location>[] = [];
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
