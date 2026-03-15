import type { DataTableColumn } from "@/presentation/components/data-table";
import type { Uom } from "@/core/domain/entities/Uom";

export function getUomTableColumns(): DataTableColumn<Uom>[] {
  return [
    {
      key: "name",
      header: "Name",
      sortable: true,
      className: "min-w-[120px] max-w-[200px]",
      render: (u) => (
        <span className="font-medium text-foreground truncate" title={u.name}>
          {u.name}
        </span>
      ),
    },
    {
      key: "abbreviation",
      header: "Abbreviation",
      className: "min-w-[80px] max-w-[120px]",
      render: (u) => (
        <span className="text-muted">{u.abbreviation}</span>
      ),
    },
    {
      key: "classId",
      header: "Class ID",
      className: "min-w-[200px] max-w-[280px]",
      render: (u) => (
        <span className="font-mono text-xs text-muted truncate" title={u.classId}>
          {u.classId}
        </span>
      ),
    },
    {
      key: "conversionRateToBase",
      header: "Conversion rate",
      className: "min-w-[80px] max-w-[120px]",
      render: (u) => (
        <span className="text-muted">
          {typeof u.conversionRateToBase === "number"
            ? u.conversionRateToBase
            : "—"}
        </span>
      ),
    },
  ];
}
