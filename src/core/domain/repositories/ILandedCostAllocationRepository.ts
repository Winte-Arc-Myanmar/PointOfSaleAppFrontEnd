import type { LandedCostAllocation } from "../entities/LandedCostAllocation";
import type { LandedCostAllocationDto } from "@/core/application/dtos/LandedCostAllocationDto";
import type { PaginatedResult } from "../types/pagination";

export interface GetLandedCostAllocationsParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc" | string;
}

export type LandedCostAllocationWriteDto = Omit<
  LandedCostAllocationDto,
  "id" | "createdAt" | "updatedAt"
>;

export interface ILandedCostAllocationRepository {
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
