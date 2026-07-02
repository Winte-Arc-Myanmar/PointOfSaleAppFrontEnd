import type { DataTableAction } from "@/presentation/components/data-table";
import type { Section } from "@/core/domain/entities/Section";

export interface SectionRowActionsConfig {
  onView?: (row: Section) => void;
  onEdit?: (row: Section) => void;
  onDelete?: (row: Section) => void;
}

export function getSectionRowActions(
  config: SectionRowActionsConfig
): DataTableAction<Section>[] {
  const actions: DataTableAction<Section>[] = [];
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
