import type { DataTableAction } from "@/presentation/components/data-table/DataTable";
import type { Role } from "@/core/domain/entities/Role";

export function getRoleRowActions(args: {
  onView: (r: Role) => void;
  onDelete: (r: Role) => void;
}): DataTableAction<Role>[] {
  return [
    { label: "View", onClick: args.onView },
    {
      label: "Delete",
      variant: "destructive",
      onClick: args.onDelete,
      disabled: (r) => r.isSystemDefault,
    },
  ];
}

