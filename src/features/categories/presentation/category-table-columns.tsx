import type { DataTableColumn } from "@/presentation/components/data-table";
import type { Category } from "@/core/domain/entities/Category";

export function getCategoryTableColumns(): DataTableColumn<Category>[] {
  return [
    {
      key: "name",
      header: "Name",
      sortable: true,
      className: "min-w-[120px] max-w-[200px]",
      render: (c) => (
        <span className="font-medium text-foreground truncate" title={c.name}>
          {c.name}
        </span>
      ),
    },
    {
      key: "description",
      header: "Description",
      className: "min-w-[140px] max-w-[260px]",
      render: (c) => (
        <span className="text-muted truncate" title={c.description ?? ""}>
          {c.description || "—"}
        </span>
      ),
    },
  ];
}
