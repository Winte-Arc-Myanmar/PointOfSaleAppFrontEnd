import type {
  PricingScheduleCreateDto,
  PricingScheduleUpdateDto,
} from "@/core/application/dtos/PricingScheduleDto";
import type { PricingSchedule } from "../entities/PricingSchedule";
import type {
  GetPricingSchedulesParams,
  IPricingScheduleRepository,
} from "../repositories/IPricingScheduleRepository";
import type { PaginatedResult } from "../types/pagination";

export interface IPricingScheduleService extends IPricingScheduleRepository {}

export type { GetPricingSchedulesParams };
