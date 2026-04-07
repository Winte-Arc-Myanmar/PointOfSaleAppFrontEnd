import type { IUploadService } from "@/core/domain/services/IUploadService";
import type { IUploadRepository } from "@/core/domain/repositories/IUploadRepository";

export class UploadService implements IUploadService {
  constructor(private readonly uploadRepository: IUploadRepository) {}

  getAll(params?: Parameters<IUploadRepository["getAll"]>[0]) {
    return this.uploadRepository.getAll(params);
  }

  uploadFile(file: File, folder?: string, branchId?: string) {
    return this.uploadRepository.uploadFile(file, folder, branchId);
  }

  uploadMultiple(files: File[], folder?: string, branchId?: string) {
    return this.uploadRepository.uploadMultiple(files, folder, branchId);
  }

  delete(url: string) {
    return this.uploadRepository.delete(url);
  }
}
