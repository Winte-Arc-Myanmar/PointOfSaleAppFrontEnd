import type { DataTableAction } from "@/presentation/components/data-table";
import type { CardTier } from "@/core/domain/entities/CardTier";

export interface CardTierRowActionsConfig {
  onView?: (row: CardTier) => void;
  onEdit?: (row: CardTier) => void;
  onDelete?: (row: CardTier) => void;
}

export function getCardTierRowActions(
  config: CardTierRowActionsConfig,
): DataTableAction<CardTier>[] {
  const actions: DataTableAction<CardTier>[] = [];
  if (config.onView) actions.push({ label: "View", onClick: config.onView });
  if (config.onEdit) actions.push({ label: "Edit", onClick: config.onEdit });
  if (config.onDelete) {
    actions.push({
      label: "Retire",
      onClick: config.onDelete,
      variant: "destructive",
    });
  }
  return actions;
}
