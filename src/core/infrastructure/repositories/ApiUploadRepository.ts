import type {
  IUploadRepository,
  GetUploadsParams,
  UploadListResult,
  UploadMultipleResult,
} from "@/core/domain/repositories/IUploadRepository";
import type { UploadedFile } from "@/core/domain/entities/UploadedFile";
import type { UploadDto, UploadMultipleResponse } from "@/core/application/dtos/UploadDto";
import { toUploadedFile } from "@/core/application/mappers/UploadMapper";
import type { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";
import {
  mapPaginatedResult,
  parsePaginatedResponse,
} from "../api/parsePaginatedResponse";

export class ApiUploadRepository implements IUploadRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(params?: GetUploadsParams): Promise<UploadListResult> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    const query: Record<string, unknown> = { page, limit };
    if (params?.folder) query.folder = params.folder;
    if (params?.branchId) query.branchId = params.branchId;

    const res = await this.httpClient.get<unknown>(API_ENDPOINTS.UPLOADS.LIST, {
      params: query,
    });
    const parsed = parsePaginatedResponse<UploadDto>(res, { page, limit });
    return mapPaginatedResult(
      parsed,
      (dto) => toUploadedFile(dto as UploadDto & { url: string }),
      (dto) => !!dto?.url,
    );
  }

  async uploadFile(file: File, folder?: string, branchId?: string): Promise<UploadedFile> {
    const formData = new FormData();
    formData.append("file", file);
    const queryParams: Record<string, string> = {};
    if (folder) queryParams.folder = folder;
    if (branchId) queryParams.branchId = branchId;

    const dto = await this.httpClient.post<UploadDto>(
      API_ENDPOINTS.UPLOADS.UPLOAD,
      formData,
      {
        params: queryParams,
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return toUploadedFile(dto);
  }

  async uploadMultiple(files: File[], folder?: string, branchId?: string): Promise<UploadMultipleResult> {
    const formData = new FormData();
    for (const file of files) {
      formData.append("files", file);
    }
    const queryParams: Record<string, string> = {};
    if (folder) queryParams.folder = folder;
    if (branchId) queryParams.branchId = branchId;

    const res = await this.httpClient.post<UploadMultipleResponse | { urls?: string[] }>(
      API_ENDPOINTS.UPLOADS.UPLOAD_MULTIPLE,
      formData,
      {
        params: queryParams,
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    const urls =
      res && "urls" in res && Array.isArray(res.urls) ? res.urls : [];
    return { urls };
  }

  async delete(id: string): Promise<void> {
    await this.httpClient.delete(API_ENDPOINTS.UPLOADS.DELETE(id));
  }
}
