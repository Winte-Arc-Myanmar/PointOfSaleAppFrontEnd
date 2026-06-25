/**
 * UOM Class repository interface.
 * Domain layer - defines the contract for data access.
 */

import type { UomClass } from "../entities/UomClass";
import type { UomClassDto } from "@/core/application/dtos/UomClassDto";
import type { PaginatedResult } from "../types/pagination";

export interface GetUomClassesParams {
  page?: number;
  limit?: number;
}

export interface IUomClassRepository {
  getAll(params?: GetUomClassesParams): Promise<PaginatedResult<UomClass>>;
  getById(id: string): Promise<UomClass | null>;
  create(data: Omit<UomClassDto, "id">): Promise<UomClass>;
  update(id: string, data: Omit<UomClassDto, "id">): Promise<UomClass>;
  delete(id: string): Promise<void>;
}
