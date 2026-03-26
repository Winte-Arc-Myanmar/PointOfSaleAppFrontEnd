/**
 * UOM Class repository interface.
 * Domain layer - defines the contract for data access.
 */

import type { UomClass } from "../entities/UomClass";
import type { UomClassDto } from "@/core/application/dtos/UomClassDto";

export interface GetUomClassesParams {
  page?: number;
  limit?: number;
}

export interface IUomClassRepository {
  getAll(params?: GetUomClassesParams): Promise<UomClass[]>;
  getById(id: string): Promise<UomClass | null>;
  create(data: Omit<UomClassDto, "id">): Promise<UomClass>;
  update(id: string, data: Omit<UomClassDto, "id">): Promise<UomClass>;
  delete(id: string): Promise<void>;
}
