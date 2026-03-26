import type { DataTableColumn } from "@/presentation/components/data-table";
import type { Tenant } from "@/core/domain/entities/Tenant";

const MAX_CHARS = 10;
const COL_WIDTH = "w-[5.5rem] max-w-[5.5rem] min-w-[5.5rem]";

function truncate(str: string | null | undefined): string {
  if (str == null || str === "") return "—";
  return str.length > MAX_CHARS ? `${str.slice(0, MAX_CHARS)}…` : str;
}

export function getTenantTableColumns(): DataTableColumn<Tenant>[] {
  return [
    {
      key: "name",
      header: "Name",
      sortable: true,
      className: COL_WIDTH,
      render: (t) => (
        <span className="font-medium text-foreground truncate" title={t.name}>
          {truncate(t.name)}
        </span>
      ),
    },
    {
      key: "legalName",
      header: "Legal name",
      className: COL_WIDTH,
      render: (t) => (
        <span className="text-muted truncate" title={t.legalName}>
          {truncate(t.legalName)}
        </span>
      ),
    },
    {
      key: "domain",
      header: "Domain",
      className: COL_WIDTH,
      render: (t) => (
        <span className="text-muted truncate" title={t.domain}>
          {truncate(t.domain)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      className: COL_WIDTH,
      render: (t) => (
        <span className="text-muted" title={t.status ?? ""}>
          {truncate(t.status ?? null)}
        </span>
      ),
    },
    {
      key: "primaryContactEmail",
      header: "Email",
      className: COL_WIDTH,
      render: (t) => (
        <span className="text-muted truncate" title={t.primaryContactEmail ?? ""}>
          {truncate(t.primaryContactEmail)}
        </span>
      ),
    },
    {
      key: "city",
      header: "City",
      className: COL_WIDTH,
      render: (t) => (
        <span className="text-muted" title={t.city ?? ""}>
          {truncate(t.city)}
        </span>
      ),
    },
    {
      key: "country",
      header: "Country",
      className: COL_WIDTH,
      render: (t) => (
        <span className="text-muted" title={t.country ?? ""}>
          {truncate(t.country)}
        </span>
      ),
    },
  ];
}
