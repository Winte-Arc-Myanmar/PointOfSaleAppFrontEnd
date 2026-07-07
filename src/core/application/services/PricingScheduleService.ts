import type {
  PricingScheduleCreateDto,
  PricingScheduleUpdateDto,
} from "@/core/application/dtos/PricingScheduleDto";
import type { PricingSchedule } from "@/core/domain/entities/PricingSchedule";
import type {
  GetPricingSchedulesParams,
  IPricingScheduleRepository,
} from "@/core/domain/repositories/IPricingScheduleRepository";
import type { IPricingScheduleService } from "@/core/domain/services/IPricingScheduleService";
import type { PaginatedResult } from "@/core/domain/types/pagination";

export class PricingScheduleService implements IPricingScheduleService {
  constructor(private readonly repository: IPricingScheduleRepository) {}

  getAll(params?: GetPricingSchedulesParams): Promise<PaginatedResult<PricingSchedule>> {
    return this.repository.getAll(params);
  }

  getById(id: string): Promise<PricingSchedule | null> {
    return this.repository.getById(id);
  }

  create(data: PricingScheduleCreateDto): Promise<PricingSchedule> {
    return this.repository.create(data);
  }

  update(id: string, data: PricingScheduleUpdateDto): Promise<PricingSchedule> {
    return this.repository.update(id, data);
  }

  delete(id: string): Promise<void> {
    return this.repository.delete(id);
  }
}
