import type { UploadedFile } from "@/core/domain/entities/UploadedFile";
import type { UploadDto } from "../dtos/UploadDto";

export function toUploadedFile(dto: UploadDto): UploadedFile {
  return {
    id: dto.id ?? dto.url,
    url: dto.url,
    folder: dto.folder ?? "",
    originalName: dto.originalName ?? "",
    mimeType: dto.mimeType ?? "",
    size: dto.size ?? 0,
    branchId: dto.branchId ?? undefined,
    createdAt: dto.createdAt,
  };
}
