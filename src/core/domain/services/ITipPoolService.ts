import type {
  TipPoolCreateAllocationDto,
  TipPoolCreateDto,
  TipPoolUpdateAllocationDto,
  TipPoolUpdateDto,
} from "@/core/application/dtos/TipPoolDto";
import type {
  GetTipPoolAllocationsParams,
  GetTipPoolsParams,
} from "@/core/domain/repositories/ITipPoolRepository";
import type { PaginatedResult } from "@/core/domain/types/pagination";
import type { TipPool, TipPoolAllocation } from "@/core/domain/entities/TipPool";

export interface ITipPoolService {
  getAll(params?: GetTipPoolsParams): Promise<PaginatedResult<TipPool>>;
  getById(id: string): Promise<TipPool | null>;
  create(data: TipPoolCreateDto): Promise<TipPool>;
  update(id: string, data: TipPoolUpdateDto): Promise<TipPool>;
  delete(id: string): Promise<void>;
  distribute(id: string): Promise<TipPool>;
  settle(id: string): Promise<TipPool>;
  getAllocations(
    id: string,
    params?: GetTipPoolAllocationsParams,
  ): Promise<PaginatedResult<TipPoolAllocation>>;
  addAllocation(id: string, data: TipPoolCreateAllocationDto): Promise<TipPoolAllocation>;
  updateAllocation(
    id: string,
    allocationId: string,
    data: TipPoolUpdateAllocationDto,
  ): Promise<TipPoolAllocation>;
  removeAllocation(id: string, allocationId: string): Promise<TipPoolAllocation>;
}
