import type { DepreciationSchedule } from "../entities/DepreciationSchedule";
import type {
  GetDepreciationSchedulesParams,
  DepreciationScheduleWriteDto,
} from "../repositories/IDepreciationScheduleRepository";
import type { PaginatedResult } from "../types/pagination";

export interface IDepreciationScheduleService {
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
