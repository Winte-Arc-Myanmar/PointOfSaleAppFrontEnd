import type { DataTableColumn } from "@/presentation/components/data-table";
import type { PromotionRule } from "@/core/domain/entities/PromotionRule";
import {
  discountLabel,
  POS_LABEL,
  scheduleLabel,
  scopeLabel,
  STATUS_LABEL,
  STATUS_STYLE,
  statusOf,
} from "./promotion-text";

export function getPromotionRuleTableColumns(options: {
  onView?: (rule: PromotionRule) => void;
  formatPrice: (value: number) => string;
  categoryName: (id: string) => string;
}): DataTableColumn<PromotionRule>[] {
  const { onView, formatPrice, categoryName } = options;
  return [
    {
      key: "name",
      header: "Promotion",
      className: "min-w-[180px]",
      render: (r) => (
        <button
          type="button"
          className="text-left hover:text-mint"
          onClick={() => onView?.(r)}
        >
          <span className="block font-medium">{r.name}</span>
          <span className="block text-xs text-muted">{discountLabel(r, formatPrice)}</span>
        </button>
      ),
    },
    {
      key: "appliesTo",
      header: "Applies to",
      className: "min-w-[160px]",
      render: (r) => (
        <span className="text-sm">
          {scopeLabel(r, categoryName)}
          {r.posTypes.length ? (
            <span className="block text-xs text-muted">{r.posTypes.map((p) => POS_LABEL[p]).join(", ")} only</span>
          ) : null}
        </span>
      ),
    },
    {
      key: "schedule",
      header: "When",
      className: "min-w-[180px]",
      render: (r) => <span className="text-sm text-muted">{scheduleLabel(r)}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (r) => {
        const status = statusOf(r);
        return (
          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[status]}`}>
            {STATUS_LABEL[status]}
          </span>
        );
      },
    },
    {
      key: "priorityLevel",
      header: "Priority",
      className: "text-right",
      render: (r) => <span className="text-sm text-muted">{r.priorityLevel}</span>,
    },
  ];
}
