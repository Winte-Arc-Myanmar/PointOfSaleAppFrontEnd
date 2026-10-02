import type { ImportResult, SheetKind } from "@/core/domain/entities/DataTransfer";

export interface IDataTransferRepository {
  download(kind: SheetKind, what: "template" | "export"): Promise<Blob>;
  import(kind: SheetKind, file: File, commit: boolean): Promise<ImportResult>;
}
