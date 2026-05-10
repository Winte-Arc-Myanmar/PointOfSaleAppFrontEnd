"use client";

import type { DataTableColumn } from "@/presentation/components/data-table/DataTable";
import type { Role } from "@/core/domain/entities/Role";

type RoleTableColumnOptions = {
  onView?: (role: Role) => void;
};

export function getRoleTableColumns(
  options: RoleTableColumnOptions = {},
): DataTableColumn<Role>[] {
  const { onView } = options;

  return [
    {
      key: "name",
      header: "Name",
      sortable: true,
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
    { key: "tenantId", header: "Tenant", sortable: false, className: "font-mono text-xs" },
    {
      key: "isSystemDefault",
      header: "Default",
      sortable: false,
      render: (r) =>
        r.isSystemDefault ? (
          <span className="inline-flex items-center rounded-md border border-mint/30 bg-mint/10 px-2 py-0.5 text-xs text-foreground">
            System
          </span>
        ) : (
          <span className="text-muted text-xs">Custom</span>
        ),
    },
  ];
}

