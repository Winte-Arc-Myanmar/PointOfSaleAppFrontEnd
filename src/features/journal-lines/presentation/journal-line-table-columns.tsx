import type { DataTableColumn } from "@/presentation/components/data-table";
import type { JournalLine } from "@/core/domain/entities/JournalLine";

type JournalLineTableColumnOptions = {
  onView?: (line: JournalLine) => void;
};

export function getJournalLineTableColumns(
  options: JournalLineTableColumnOptions = {},
): DataTableColumn<JournalLine>[] {
  const { onView } = options;

  return [
    {
      key: "accountId",
      header: "Account",
      className: "min-w-[200px] max-w-[240px]",
      render: (l) =>
        onView ? (
          <button
            type="button"
            className="font-mono text-xs text-foreground truncate text-left hover:text-mint transition-colors"
            title={l.accountId}
            onClick={() => onView(l)}
          >
            {l.accountId}
          </button>
        ) : (
          <span className="font-mono text-xs text-foreground truncate" title={l.accountId}>
            {l.accountId}
          </span>
        ),
    },
    {
      key: "transactionCurrency",
      header: "Currency",
      className: "min-w-[80px]",
      render: (l) => (
        <span className="font-mono text-sm font-medium">{l.transactionCurrency}</span>
      ),
    },
    {
      key: "transactionDebit",
      header: "Txn Debit",
      className: "min-w-[110px]",
      render: (l) => (
        <span className="font-mono text-sm text-foreground">{l.transactionDebit}</span>
      ),
    },
    {
      key: "transactionCredit",
      header: "Txn Credit",
      className: "min-w-[110px]",
      render: (l) => (
        <span className="font-mono text-sm text-foreground">{l.transactionCredit}</span>
      ),
    },
    {
      key: "exchangeRate",
      header: "Rate",
      className: "min-w-[90px]",
      render: (l) => (
        <span className="font-mono text-sm text-muted">{l.exchangeRate}</span>
      ),
    },
    {
      key: "baseDebit",
      header: "Base Debit",
      className: "min-w-[110px]",
      render: (l) => (
        <span className="font-mono text-sm text-foreground">{l.baseDebit}</span>
      ),
    },
    {
      key: "baseCredit",
      header: "Base Credit",
      className: "min-w-[110px]",
      render: (l) => (
        <span className="font-mono text-sm text-foreground">{l.baseCredit}</span>
      ),
    },
  ];
}
