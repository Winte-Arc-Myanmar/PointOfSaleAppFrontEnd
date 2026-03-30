"use client";

import type { DataTableColumn } from "@/presentation/components/data-table/DataTable";
import type { Role } from "@/core/domain/entities/Role";

export function getRoleTableColumns(): DataTableColumn<Role>[] {
  return [
    { key: "name", header: "Name", sortable: true },
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

