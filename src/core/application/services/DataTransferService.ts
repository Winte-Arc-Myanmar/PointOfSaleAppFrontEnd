/**
 * Excel import and export service.
 * Application layer - delegates to IDataTransferRepository.
 */

import type { ImportResult, SheetKind } from "@/core/domain/entities/DataTransfer";
import type { IDataTransferRepository } from "@/core/domain/repositories/IDataTransferRepository";
import type { IDataTransferService } from "@/core/domain/services/IDataTransferService";

export class DataTransferService implements IDataTransferService {
  constructor(private readonly repo: IDataTransferRepository) {}

  download(kind: SheetKind, what: "template" | "export"): Promise<Blob> {
    return this.repo.download(kind, what);
  }

  preview(kind: SheetKind, file: File): Promise<ImportResult> {
    return this.repo.import(kind, file, false);
  }

  commit(kind: SheetKind, file: File): Promise<ImportResult> {
    return this.repo.import(kind, file, true);
  }
}
