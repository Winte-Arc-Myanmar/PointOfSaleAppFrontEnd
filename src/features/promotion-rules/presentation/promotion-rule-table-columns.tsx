import type { DataTableColumn } from "@/presentation/components/data-table";
import type { PromotionRule } from "@/core/domain/entities/PromotionRule";

export function getPromotionRuleTableColumns(): DataTableColumn<PromotionRule>[] {
  return [
    {
      key: "name",
      header: "Name",
      sortable: true,
      className: "min-w-[160px] max-w-[280px]",
      render: (r) => (
        <span className="font-medium text-foreground truncate" title={r.name}>
          {r.name}
        </span>
      ),
    },
    {
      key: "rewardAction",
      header: "Reward",
      className: "min-w-[140px] max-w-[220px]",
      render: (r) => (
        <span className="text-muted">
          {r.rewardAction?.type ?? "—"}
          {r.rewardAction?.value != null ? ` · ${String(r.rewardAction.value)}` : ""}
        </span>
      ),
    },
    {
      key: "priorityLevel",
      header: "Priority",
      sortable: true,
      className: "min-w-[70px] max-w-[110px]",
      render: (r) => <span className="text-muted">{String(r.priorityLevel ?? 0)}</span>,
    },
    {
      key: "isStackable",
      header: "Stackable",
      className: "min-w-[90px] max-w-[110px]",
      render: (r) => (
        <span className="text-muted">
          {r.isStackable ? "Yes" : "No"}
        </span>
      ),
    },
  ];
}

