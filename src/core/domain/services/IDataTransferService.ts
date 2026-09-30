import type { ImportResult, SheetKind } from "@/core/domain/entities/DataTransfer";

export interface IDataTransferService {
  download(kind: SheetKind, what: "template" | "export"): Promise<Blob>;
  preview(kind: SheetKind, file: File): Promise<ImportResult>;
  commit(kind: SheetKind, file: File): Promise<ImportResult>;
}
