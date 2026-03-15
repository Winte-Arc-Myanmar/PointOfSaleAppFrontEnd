import type { DataTableColumn } from "@/presentation/components/data-table";
import type { Branch } from "@/core/domain/entities/Branch";

function truncate(str: string | null | undefined, max = 12): string {
  if (str == null || str === "") return "—";
  return str.length > max ? `${str.slice(0, max)}…` : str;
}

export function getBranchTableColumns(): DataTableColumn<Branch>[] {
  return [
    {
      key: "name",
      header: "Name",
      sortable: true,
      className: "min-w-[120px] max-w-[200px]",
      render: (b) => (
        <span className="font-medium text-foreground truncate" title={b.name}>
          {truncate(b.name)}
        </span>
      ),
    },
    {
      key: "branchCode",
      header: "Code",
      className: "min-w-[80px] max-w-[120px]",
      render: (b) => (
        <span className="font-mono text-sm" title={b.branchCode}>
          {truncate(b.branchCode, 8)}
        </span>
      ),
    },
    {
      key: "type",
      header: "Type",
      className: "min-w-[90px] max-w-[140px]",
      render: (b) => (
        <span className="text-muted" title={b.type}>
          {truncate(b.type, 10)}
        </span>
      ),
    },
    {
      key: "city",
      header: "City",
      className: "min-w-[90px] max-w-[140px]",
      render: (b) => (
        <span className="text-muted" title={b.city ?? ""}>
          {truncate(b.city ?? null, 10)}
        </span>
      ),
    },
    {
      key: "country",
      header: "Country",
      className: "min-w-[80px] max-w-[120px]",
      render: (b) => (
        <span className="text-muted" title={b.country ?? ""}>
          {truncate(b.country ?? null, 8)}
        </span>
      ),
    },
    {
      key: "email",
      header: "Email",
      className: "min-w-[140px] max-w-[200px]",
      render: (b) => (
        <span className="text-muted truncate text-xs" title={b.email ?? ""}>
          {truncate(b.email ?? null, 14)}
        </span>
      ),
    },
  ];
}
