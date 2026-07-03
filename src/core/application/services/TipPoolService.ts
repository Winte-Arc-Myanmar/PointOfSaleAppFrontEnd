import type {
  TipPoolCreateAllocationDto,
  TipPoolCreateDto,
  TipPoolUpdateAllocationDto,
  TipPoolUpdateDto,
} from "@/core/application/dtos/TipPoolDto";
import type { TipPool, TipPoolAllocation } from "@/core/domain/entities/TipPool";
import type {
  GetTipPoolAllocationsParams,
  GetTipPoolsParams,
  ITipPoolRepository,
} from "@/core/domain/repositories/ITipPoolRepository";
import type { ITipPoolService } from "@/core/domain/services/ITipPoolService";
import type { PaginatedResult } from "@/core/domain/types/pagination";

export class TipPoolService implements ITipPoolService {
  constructor(private readonly tipPoolRepository: ITipPoolRepository) {}

  getAll(params?: GetTipPoolsParams): Promise<PaginatedResult<TipPool>> {
    return this.tipPoolRepository.getAll(params);
  }

  getById(id: string): Promise<TipPool | null> {
    return this.tipPoolRepository.getById(id);
  }

  create(data: TipPoolCreateDto): Promise<TipPool> {
    return this.tipPoolRepository.create(data);
  }

  update(id: string, data: TipPoolUpdateDto): Promise<TipPool> {
    return this.tipPoolRepository.update(id, data);
  }

  delete(id: string): Promise<void> {
    return this.tipPoolRepository.delete(id);
  }

  distribute(id: string): Promise<TipPool> {
    return this.tipPoolRepository.distribute(id);
  }

  settle(id: string): Promise<TipPool> {
    return this.tipPoolRepository.settle(id);
  }

  getAllocations(
    id: string,
    params?: GetTipPoolAllocationsParams,
  ): Promise<PaginatedResult<TipPoolAllocation>> {
    return this.tipPoolRepository.getAllocations(id, params);
  }

  addAllocation(id: string, data: TipPoolCreateAllocationDto): Promise<TipPoolAllocation> {
    return this.tipPoolRepository.addAllocation(id, data);
  }

  updateAllocation(
    id: string,
    allocationId: string,
    data: TipPoolUpdateAllocationDto,
  ): Promise<TipPoolAllocation> {
    return this.tipPoolRepository.updateAllocation(id, allocationId, data);
  }

  removeAllocation(id: string, allocationId: string): Promise<TipPoolAllocation> {
    return this.tipPoolRepository.removeAllocation(id, allocationId);
  }
}
