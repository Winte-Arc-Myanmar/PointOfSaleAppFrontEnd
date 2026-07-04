import type { DataTableColumn } from "@/presentation/components/data-table";
import type { DiscountReason } from "@/core/domain/entities/DiscountReason";

type DiscountReasonTableColumnOptions = {
  onView?: (reason: DiscountReason) => void;
};

export function getDiscountReasonTableColumns(
  options: DiscountReasonTableColumnOptions = {},
): DataTableColumn<DiscountReason>[] {
  const { onView } = options;

  return [
    {
      key: "code",
      header: "Code",
      sortable: true,
      className: "min-w-[140px]",
      render: (r) => (
        <span className="font-mono text-sm text-foreground">{r.code}</span>
      ),
    },
    {
      key: "name",
      header: "Name",
      sortable: true,
      className: "min-w-[180px] max-w-[260px]",
      render: (r) =>
        onView ? (
          <button
            type="button"
            className="font-medium text-foreground truncate text-left hover:text-mint transition-colors"
            title={r.name}
            onClick={() => onView(r)}
          >
            {r.name}
          </button>
        ) : (
          <span className="font-medium text-foreground truncate" title={r.name}>
            {r.name}
          </span>
        ),
    },
    {
      key: "isActive",
      header: "Status",
      className: "min-w-[100px]",
      render: (r) => (
        <span className={r.isActive ? "text-green-600 font-medium" : "text-muted"}>
          {r.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "requiresManagerOverride",
      header: "Manager override",
      className: "min-w-[140px]",
      render: (r) => (
        <span className={r.requiresManagerOverride ? "text-amber-600 font-medium" : "text-muted"}>
          {r.requiresManagerOverride ? "Required" : "No"}
        </span>
      ),
    },
    {
      key: "description",
      header: "Description",
      className: "min-w-[200px] max-w-[280px]",
      render: (r) => (
        <span className="text-muted truncate" title={r.description}>
          {r.description || "—"}
        </span>
      ),
    },
  ];
}
