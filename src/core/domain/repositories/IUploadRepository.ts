import type { UploadedFile } from "../entities/UploadedFile";
import type { PaginatedResult } from "../types/pagination";

export interface GetUploadsParams {
  page?: number;
  limit?: number;
  folder?: string;
  branchId?: string;
}

export type UploadListResult = PaginatedResult<UploadedFile>;

export interface UploadMultipleResult {
  urls: string[];
}

export interface IUploadRepository {
  getAll(params?: GetUploadsParams): Promise<UploadListResult>;
  uploadFile(file: File, folder?: string, branchId?: string): Promise<UploadedFile>;
  uploadMultiple(files: File[], folder?: string, branchId?: string): Promise<UploadMultipleResult>;
  delete(id: string): Promise<void>;
}
