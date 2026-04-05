import type {
  IUploadRepository,
  GetUploadsParams,
  UploadListResult,
  UploadMultipleResult,
} from "@/core/domain/repositories/IUploadRepository";
import type { UploadedFile } from "@/core/domain/entities/UploadedFile";
import type { UploadDto, UploadListResponse, UploadMultipleResponse } from "@/core/application/dtos/UploadDto";
import { toUploadedFile } from "@/core/application/mappers/UploadMapper";
import type { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";

export class ApiUploadRepository implements IUploadRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(params?: GetUploadsParams): Promise<UploadListResult> {
    const query: Record<string, unknown> = {
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
    };
    if (params?.folder) query.folder = params.folder;
    if (params?.branchId) query.branchId = params.branchId;

    const res = await this.httpClient.get<
      UploadListResponse | UploadDto[] | { data?: UploadDto[]; total?: number }
    >(API_ENDPOINTS.UPLOADS.LIST, { params: query });

    let items: UploadDto[] = [];
    let total: number | undefined;

    if (Array.isArray(res)) {
      items = res;
    } else if (res && typeof res === "object") {
      if ("items" in res && Array.isArray((res as UploadListResponse).items)) {
        items = (res as UploadListResponse).items;
        total = (res as UploadListResponse).total;
      } else if ("data" in res && Array.isArray((res as { data?: UploadDto[] }).data)) {
        items = (res as { data: UploadDto[] }).data;
        total = (res as { total?: number }).total;
      }
    }

    return {
      items: items.filter((d) => !!d?.url).map(toUploadedFile),
      total,
    };
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

  async delete(url: string): Promise<void> {
    await this.httpClient.post(API_ENDPOINTS.UPLOADS.DELETE, { url });
  }
}
