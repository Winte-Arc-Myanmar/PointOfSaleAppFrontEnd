import type { DataTableColumn } from "@/presentation/components/data-table";
import type { FixedAsset } from "@/core/domain/entities/FixedAsset";
import { formatDate } from "@/presentation/components/detail";

type FixedAssetTableColumnOptions = {
  onView?: (asset: FixedAsset) => void;
};

function statusClassName(status: string): string {
  if (status === "ACTIVE") return "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400";
  return "border-border bg-muted text-foreground";
}

export function getFixedAssetTableColumns(
  options: FixedAssetTableColumnOptions = {},
): DataTableColumn<FixedAsset>[] {
  const { onView } = options;

  return [
    {
      key: "assetName",
      header: "Asset Name",
      sortable: true,
      className: "min-w-[180px] max-w-[260px]",
      render: (a) =>
        onView ? (
          <button
            type="button"
            className="font-medium text-foreground truncate text-left hover:text-mint transition-colors"
            title={a.assetName}
            onClick={() => onView(a)}
          >
            {a.assetName}
          </button>
        ) : (
          <span className="font-medium text-foreground truncate" title={a.assetName}>
            {a.assetName}
          </span>
        ),
    },
    {
      key: "serialNumber",
      header: "Serial",
      className: "min-w-[120px]",
      render: (a) => (
        <span className="font-mono text-xs text-muted">{a.serialNumber}</span>
      ),
    },
    {
      key: "purchaseCost",
      header: "Cost",
      sortable: true,
      className: "min-w-[110px]",
      render: (a) => (
        <span className="font-mono text-sm text-foreground">{a.purchaseCost}</span>
      ),
    },
    {
      key: "purchaseDate",
      header: "Purchase Date",
      sortable: true,
      className: "min-w-[130px]",
      render: (a) => (
        <span className="text-sm text-foreground">{formatDate(a.purchaseDate)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      className: "min-w-[100px]",
      render: (a) => (
        <span
          className={`rounded-md border px-2 py-1 text-xs font-medium ${statusClassName(a.status)}`}
        >
          {a.status}
        </span>
      ),
    },
    {
      key: "depreciationMethod",
      header: "Method",
      className: "min-w-[130px]",
      render: (a) => (
        <span className="text-xs text-muted">{a.depreciationMethod}</span>
      ),
    },
  ];
}
