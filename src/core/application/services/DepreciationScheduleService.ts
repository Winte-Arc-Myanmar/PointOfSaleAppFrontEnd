import type { IDepreciationScheduleService } from "@/core/domain/services/IDepreciationScheduleService";
import type { IDepreciationScheduleRepository } from "@/core/domain/repositories/IDepreciationScheduleRepository";
import type { DepreciationSchedule } from "@/core/domain/entities/DepreciationSchedule";
import type {
  GetDepreciationSchedulesParams,
  DepreciationScheduleWriteDto,
} from "@/core/domain/repositories/IDepreciationScheduleRepository";
import type { PaginatedResult } from "@/core/domain/types/pagination";

export class DepreciationScheduleService implements IDepreciationScheduleService {
  constructor(
    private readonly depreciationScheduleRepository: IDepreciationScheduleRepository
  ) {}

  getAll(
    fixedAssetId: string,
    params?: GetDepreciationSchedulesParams
  ): Promise<PaginatedResult<DepreciationSchedule>> {
    return this.depreciationScheduleRepository.getAll(fixedAssetId, params);
  }

  getById(fixedAssetId: string, id: string): Promise<DepreciationSchedule | null> {
    return this.depreciationScheduleRepository.getById(fixedAssetId, id);
  }

  create(
    fixedAssetId: string,
    data: DepreciationScheduleWriteDto
  ): Promise<DepreciationSchedule> {
    return this.depreciationScheduleRepository.create(fixedAssetId, data);
  }

  update(
    fixedAssetId: string,
    id: string,
    data: DepreciationScheduleWriteDto
  ): Promise<DepreciationSchedule> {
    return this.depreciationScheduleRepository.update(fixedAssetId, id, data);
  }

  delete(fixedAssetId: string, id: string): Promise<void> {
    return this.depreciationScheduleRepository.delete(fixedAssetId, id);
  }
}
