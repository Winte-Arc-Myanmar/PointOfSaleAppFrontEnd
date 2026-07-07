import type {
  PricingScheduleCreateDto,
  PricingScheduleUpdateDto,
} from "@/core/application/dtos/PricingScheduleDto";
import type { PricingSchedule } from "../entities/PricingSchedule";
import type { PaginatedResult } from "../types/pagination";

export interface GetPricingSchedulesParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc" | string;
}

export interface IPricingScheduleRepository {
  getAll(params?: GetPricingSchedulesParams): Promise<PaginatedResult<PricingSchedule>>;
  getById(id: string): Promise<PricingSchedule | null>;
  create(data: PricingScheduleCreateDto): Promise<PricingSchedule>;
  update(id: string, data: PricingScheduleUpdateDto): Promise<PricingSchedule>;
  delete(id: string): Promise<void>;
}
