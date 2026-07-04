import type { DataTableColumn } from "@/presentation/components/data-table";
import type { ModifierGroup } from "@/core/domain/entities/ModifierGroup";

type ModifierGroupTableColumnOptions = {
  onView?: (group: ModifierGroup) => void;
};

export function getModifierGroupTableColumns(
  options: ModifierGroupTableColumnOptions = {},
): DataTableColumn<ModifierGroup>[] {
  const { onView } = options;

  return [
    {
      key: "name",
      header: "Name",
      sortable: true,
      className: "min-w-[160px] max-w-[240px]",
      render: (g) =>
        onView ? (
          <button
            type="button"
            className="font-medium text-foreground truncate text-left hover:text-mint transition-colors"
            title={g.name}
            onClick={() => onView(g)}
          >
            {g.name}
          </button>
        ) : (
          <span className="font-medium text-foreground truncate" title={g.name}>
            {g.name}
          </span>
        ),
    },
    {
      key: "minSelection",
      header: "Min",
      className: "min-w-[70px] max-w-[90px]",
      render: (g) => <span className="text-muted">{g.minSelection}</span>,
    },
    {
      key: "maxSelection",
      header: "Max",
      className: "min-w-[70px] max-w-[90px]",
      render: (g) => <span className="text-muted">{g.maxSelection}</span>,
    },
    {
      key: "isRequired",
      header: "Required",
      className: "min-w-[90px] max-w-[120px]",
      render: (g) => <span className="text-muted">{g.isRequired ? "Yes" : "No"}</span>,
    },
    {
      key: "tenantId",
      header: "Tenant",
      className: "min-w-[140px] max-w-[220px]",
      render: (g) => (
        <span className="font-mono text-xs text-muted truncate" title={g.tenantId}>
          {g.tenantId}
        </span>
      ),
    },
  ];
}
