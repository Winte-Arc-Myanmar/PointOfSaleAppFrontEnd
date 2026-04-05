export interface UploadDto {
  id?: string;
  url: string;
  folder?: string;
  originalName?: string;
  mimeType?: string;
  size?: number;
  branchId?: string | null;
  createdAt?: string;
}

export interface UploadListResponse {
  items: UploadDto[];
  total?: number;
}

export interface UploadMultipleResponse {
  urls: string[];
}
