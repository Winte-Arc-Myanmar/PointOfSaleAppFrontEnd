import type { UploadedFile } from "../entities/UploadedFile";
import type {
  GetUploadsParams,
  UploadListResult,
  UploadMultipleResult,
} from "../repositories/IUploadRepository";

export interface IUploadService {
  getAll(params?: GetUploadsParams): Promise<UploadListResult>;
  uploadFile(file: File, folder?: string, branchId?: string): Promise<UploadedFile>;
  uploadMultiple(files: File[], folder?: string, branchId?: string): Promise<UploadMultipleResult>;
  delete(url: string): Promise<void>;
}
