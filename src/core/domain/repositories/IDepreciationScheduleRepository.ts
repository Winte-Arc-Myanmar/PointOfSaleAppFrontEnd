import type { DepreciationSchedule } from "../entities/DepreciationSchedule";
import type { DepreciationScheduleDto } from "@/core/application/dtos/DepreciationScheduleDto";
import type { PaginatedResult } from "../types/pagination";

export interface GetDepreciationSchedulesParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc" | string;
}

export type DepreciationScheduleWriteDto = Omit<
  DepreciationScheduleDto,
  "id" | "assetId"
>;

export interface IDepreciationScheduleRepository {
  getAll(
    fixedAssetId: string,
    params?: GetDepreciationSchedulesParams
  ): Promise<PaginatedResult<DepreciationSchedule>>;
  getById(fixedAssetId: string, id: string): Promise<DepreciationSchedule | null>;
  create(
    fixedAssetId: string,
    data: DepreciationScheduleWriteDto
  ): Promise<DepreciationSchedule>;
  update(
    fixedAssetId: string,
    id: string,
    data: DepreciationScheduleWriteDto
  ): Promise<DepreciationSchedule>;
  delete(fixedAssetId: string, id: string): Promise<void>;
}
