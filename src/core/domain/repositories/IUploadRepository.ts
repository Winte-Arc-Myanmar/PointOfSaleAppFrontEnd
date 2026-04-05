import type { UploadedFile } from "../entities/UploadedFile";

export interface GetUploadsParams {
  page?: number;
  limit?: number;
  folder?: string;
  branchId?: string;
}

export interface UploadListResult {
  items: UploadedFile[];
  total?: number;
}

export interface UploadMultipleResult {
  urls: string[];
}

export interface IUploadRepository {
  getAll(params?: GetUploadsParams): Promise<UploadListResult>;
  uploadFile(file: File, folder?: string, branchId?: string): Promise<UploadedFile>;
  uploadMultiple(files: File[], folder?: string, branchId?: string): Promise<UploadMultipleResult>;
  delete(url: string): Promise<void>;
}
