import type { DataTableAction } from "@/presentation/components/data-table";
import type { UploadedFile } from "@/core/domain/entities/UploadedFile";

export interface UploadsRowActionsConfig {
  onDelete?: (row: UploadedFile) => void;
}

export function getUploadsRowActions(
  config: UploadsRowActionsConfig
): DataTableAction<UploadedFile>[] {
  const actions: DataTableAction<UploadedFile>[] = [];
  if (config.onDelete) {
    actions.push({
      label: "Delete",
      onClick: config.onDelete,
      variant: "destructive",
    });
  }
  return actions;
}
