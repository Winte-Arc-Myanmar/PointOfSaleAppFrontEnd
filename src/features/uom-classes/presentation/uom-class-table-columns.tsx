import type { DataTableColumn } from "@/presentation/components/data-table";
import type { UomClass } from "@/core/domain/entities/UomClass";

type UomClassTableColumnOptions = {
  onView?: (uomClass: UomClass) => void;
};

export function getUomClassTableColumns(
  options: UomClassTableColumnOptions = {},
): DataTableColumn<UomClass>[] {
  const { onView } = options;

  return [
    {
      key: "name",
      header: "Name",
      sortable: true,
      className: "min-w-[120px] max-w-[200px]",
      render: (c) =>
        onView ? (
          <button
            type="button"
            className="font-medium text-foreground truncate text-left hover:text-mint transition-colors"
            title={c.name}
            onClick={() => onView(c)}
          >
            {c.name}
          </button>
        ) : (
          <span className="font-medium text-foreground truncate" title={c.name}>
            {c.name}
          </span>
        ),
    },
  ];
}
