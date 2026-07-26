import type { LandedCostAllocation } from "../entities/LandedCostAllocation";
import type {
  GetLandedCostAllocationsParams,
  LandedCostAllocationWriteDto,
} from "../repositories/ILandedCostAllocationRepository";
import type { PaginatedResult } from "../types/pagination";

export interface ILandedCostAllocationService {
  getAll(
    params?: GetLandedCostAllocationsParams,
  ): Promise<PaginatedResult<LandedCostAllocation>>;
  getById(id: string): Promise<LandedCostAllocation | null>;
  create(data: LandedCostAllocationWriteDto): Promise<LandedCostAllocation>;
  update(
    id: string,
    data: LandedCostAllocationWriteDto,
  ): Promise<LandedCostAllocation>;
  delete(id: string): Promise<void>;
}
