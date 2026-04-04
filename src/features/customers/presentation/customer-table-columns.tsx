import type { DataTableColumn } from "@/presentation/components/data-table";
import type { Customer } from "@/core/domain/entities/Customer";

export function getCustomerTableColumns(): DataTableColumn<Customer>[] {
  return [
    {
      key: "name",
      header: "Name",
      sortable: true,
      className: "min-w-[160px] max-w-[260px]",
      render: (c) => (
        <span className="font-medium text-foreground truncate" title={c.name}>
          {c.name}
        </span>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      className: "min-w-[140px] max-w-[180px]",
      render: (c) => (
        <span className="font-mono text-xs text-muted truncate" title={c.phone}>
          {c.phone || "-"}
        </span>
      ),
    },
    {
      key: "email",
      header: "Email",
      className: "min-w-[200px] max-w-[280px]",
      render: (c) => (
        <span className="text-sm text-muted truncate" title={c.email}>
          {c.email || "-"}
        </span>
      ),
    },
    {
      key: "accountType",
      header: "Account type",
      className: "min-w-[120px] max-w-[160px]",
      render: (c) => (
        <span className="text-sm text-foreground truncate" title={c.accountType}>
          {c.accountType}
        </span>
      ),
    },
    {
      key: "loyaltyTier",
      header: "Loyalty tier",
      className: "min-w-[120px] max-w-[160px]",
      render: (c) => (
        <span className="text-sm text-foreground truncate" title={c.loyaltyTier}>
          {c.loyaltyTier}
        </span>
      ),
    },
    {
      key: "hasCreditAccount",
      header: "Credit",
      className: "min-w-[90px] max-w-[110px]",
      render: (c) => (
        <span className={c.hasCreditAccount ? "text-mint" : "text-muted"}>
          {c.hasCreditAccount ? "Yes" : "No"}
        </span>
      ),
    },
  ];
}

