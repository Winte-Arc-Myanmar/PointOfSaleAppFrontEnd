import type { DataTableColumn } from "@/presentation/components/data-table";
import type { Tenant } from "@/core/domain/entities/Tenant";

export function getTenantTableColumns(): DataTableColumn<Tenant>[] {
  return [
    {
      key: "name",
      header: "Name",
      sortable: true,
      className: "min-w-[120px] max-w-[200px]",
      render: (t) => (
        <span className="font-medium text-foreground truncate" title={t.name}>
          {t.name}
        </span>
      ),
    },
    {
      key: "legalName",
      header: "Legal name",
      className: "min-w-[140px] max-w-[220px]",
      render: (t) => (
        <span className="text-muted truncate" title={t.legalName}>
          {t.legalName}
        </span>
      ),
    },
    {
      key: "domain",
      header: "Domain",
      className: "min-w-[100px] max-w-[160px]",
      render: (t) => (
        <span className="text-muted truncate" title={t.domain}>
          {t.domain}
        </span>
      ),
    },
    {
      key: "primaryContactEmail",
      header: "Contact email",
      className: "min-w-[160px] max-w-[240px]",
      render: (t) => (
        <span className="text-muted truncate" title={t.primaryContactEmail}>
          {t.primaryContactEmail}
        </span>
      ),
    },
    {
      key: "city",
      header: "City",
      className: "min-w-[80px] max-w-[120px]",
      render: (t) => <span className="text-muted">{t.city}</span>,
    },
    {
      key: "country",
      header: "Country",
      className: "min-w-[80px] max-w-[120px]",
      render: (t) => <span className="text-muted">{t.country}</span>,
    },
  ];
}
