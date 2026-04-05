import type { DataTableColumn } from "@/presentation/components/data-table";
import type { UploadedFile } from "@/core/domain/entities/UploadedFile";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function getUploadsTableColumns(): DataTableColumn<UploadedFile>[] {
  return [
    {
      key: "originalName",
      header: "File name",
      sortable: true,
      className: "min-w-[140px] max-w-[260px]",
      render: (row) => (
        <span className="font-medium text-foreground truncate" title={row.originalName || row.url}>
          {row.originalName || row.url.split("/").pop() || "—"}
        </span>
      ),
    },
    {
      key: "folder",
      header: "Folder",
      className: "min-w-[80px] max-w-[140px]",
      render: (row) => <span className="text-muted">{row.folder || "—"}</span>,
    },
    {
      key: "mimeType",
      header: "Type",
      className: "min-w-[80px] max-w-[120px]",
      render: (row) => <span className="text-muted">{row.mimeType || "—"}</span>,
    },
    {
      key: "size",
      header: "Size",
      className: "min-w-[60px] max-w-[100px]",
      render: (row) => (
        <span className="text-muted">{row.size ? formatBytes(row.size) : "—"}</span>
      ),
    },
    {
      key: "url",
      header: "URL",
      className: "min-w-[120px] max-w-[260px]",
      render: (row) => (
        <span className="font-mono text-xs text-muted truncate" title={row.url}>
          {row.url}
        </span>
      ),
    },
  ];
}
