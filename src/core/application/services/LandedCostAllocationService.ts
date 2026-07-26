import type { ILandedCostAllocationService } from "@/core/domain/services/ILandedCostAllocationService";
import type { ILandedCostAllocationRepository } from "@/core/domain/repositories/ILandedCostAllocationRepository";
import type { LandedCostAllocation } from "@/core/domain/entities/LandedCostAllocation";
import type {
  GetLandedCostAllocationsParams,
  LandedCostAllocationWriteDto,
} from "@/core/domain/repositories/ILandedCostAllocationRepository";
import type { PaginatedResult } from "@/core/domain/types/pagination";

export class LandedCostAllocationService
  implements ILandedCostAllocationService
{
  constructor(
    private readonly landedCostAllocationRepository: ILandedCostAllocationRepository,
  ) {}

  getAll(
    params?: GetLandedCostAllocationsParams,
  ): Promise<PaginatedResult<LandedCostAllocation>> {
    return this.landedCostAllocationRepository.getAll(params);
  }

  getById(id: string): Promise<LandedCostAllocation | null> {
    return this.landedCostAllocationRepository.getById(id);
  }

  create(
    data: LandedCostAllocationWriteDto,
  ): Promise<LandedCostAllocation> {
    return this.landedCostAllocationRepository.create(data);
  }

  update(
    id: string,
    data: LandedCostAllocationWriteDto,
  ): Promise<LandedCostAllocation> {
    return this.landedCostAllocationRepository.update(id, data);
  }

  delete(id: string): Promise<void> {
    return this.landedCostAllocationRepository.delete(id);
  }
}
