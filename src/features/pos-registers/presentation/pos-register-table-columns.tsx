import type { DataTableColumn } from "@/presentation/components/data-table";
import type { PosRegister } from "@/core/domain/entities/PosRegister";

export function getPosRegisterTableColumns(): DataTableColumn<PosRegister>[] {
  return [
    {
      key: "name",
      header: "Name",
      sortable: true,
      className: "min-w-[140px] max-w-[220px]",
      render: (r) => (
        <span className="font-medium text-foreground truncate" title={r.name}>
          {r.name}
        </span>
      ),
    },
    {
      key: "locationId",
      header: "Location",
      className: "min-w-[140px] max-w-[220px]",
      render: (r) => (
        <span className="font-mono text-xs text-muted truncate" title={r.locationId}>
          {r.locationId}
        </span>
      ),
    },
    {
      key: "macAddress",
      header: "MAC address",
      className: "min-w-[140px] max-w-[200px]",
      render: (r) => (
        <span className="font-mono text-xs text-muted truncate" title={r.macAddress}>
          {r.macAddress}
        </span>
      ),
    },
  ];
}

