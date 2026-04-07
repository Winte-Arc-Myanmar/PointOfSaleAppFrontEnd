import type { DataTableAction } from "@/presentation/components/data-table";
import type { PromotionRule } from "@/core/domain/entities/PromotionRule";

export interface PromotionRuleRowActionsConfig {
  onView?: (row: PromotionRule) => void;
  onEdit?: (row: PromotionRule) => void;
  onDelete?: (row: PromotionRule) => void;
}

export function getPromotionRuleRowActions(
  config: PromotionRuleRowActionsConfig
): DataTableAction<PromotionRule>[] {
  const actions: DataTableAction<PromotionRule>[] = [];
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

