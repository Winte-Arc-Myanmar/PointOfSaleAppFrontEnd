import type { FixedAsset } from "../entities/FixedAsset";
import type { FixedAssetDto } from "@/core/application/dtos/FixedAssetDto";
import type { PaginatedResult } from "../types/pagination";

export interface GetFixedAssetsParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc" | string;
}

export type FixedAssetWriteDto = Omit<FixedAssetDto, "id" | "createdAt" | "updatedAt">;

export interface IFixedAssetRepository {
  getAll(params?: GetFixedAssetsParams): Promise<PaginatedResult<FixedAsset>>;
  getById(id: string): Promise<FixedAsset | null>;
  create(data: FixedAssetWriteDto): Promise<FixedAsset>;
  update(id: string, data: FixedAssetWriteDto): Promise<FixedAsset>;
  delete(id: string): Promise<void>;
}
