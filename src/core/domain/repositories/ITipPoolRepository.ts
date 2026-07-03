import type {
  TipPoolCreateAllocationDto,
  TipPoolCreateDto,
  TipPoolUpdateAllocationDto,
  TipPoolUpdateDto,
} from "@/core/application/dtos/TipPoolDto";
import type {
  TipPool,
  TipPoolAllocation,
  TipPoolStatus,
} from "@/core/domain/entities/TipPool";
import type { PaginatedResult } from "@/core/domain/types/pagination";

export interface GetTipPoolsParams {
  page?: number;
  limit?: number;
  locationId?: string;
  status?: TipPoolStatus;
  fromDate?: string;
  toDate?: string;
}

export interface GetTipPoolAllocationsParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc" | string;
}

export interface ITipPoolRepository {
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
