import type { Id } from "@/core/domain/types";

export interface UploadedFile {
  id: Id;
  url: string;
  folder: string;
  originalName: string;
  mimeType: string;
  size: number;
  branchId?: string | null;
  createdAt?: string;
}
