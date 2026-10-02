/**
 * Excel import and export repository - calls the data-transfer API.
 * Infrastructure layer.
 */

import type { ImportResult, SheetKind } from "@/core/domain/entities/DataTransfer";
import type { IDataTransferRepository } from "@/core/domain/repositories/IDataTransferRepository";
import type { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";

export class ApiDataTransferRepository implements IDataTransferRepository {
  constructor(private readonly httpClient: HttpClient) {}

  download(kind: SheetKind, what: "template" | "export"): Promise<Blob> {
    return this.httpClient.getBlob(
      what === "template"
        ? API_ENDPOINTS.DATA_TRANSFER.TEMPLATE(kind)
        : API_ENDPOINTS.DATA_TRANSFER.EXPORT(kind),
    );
  }

  import(kind: SheetKind, file: File, commit: boolean): Promise<ImportResult> {
    const form = new FormData();
    form.append("file", file);
    return this.httpClient.postForm<ImportResult>(
      API_ENDPOINTS.DATA_TRANSFER.IMPORT(kind),
      form,
      { params: commit ? { commit: "true" } : undefined },
    );
  }
}
