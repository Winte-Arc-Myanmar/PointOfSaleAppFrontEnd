/**
 * UOM repository interface.
 * Domain layer - defines the contract for data access.
 */

import type { Uom } from "../entities/Uom";
import type { UomDto } from "@/core/application/dtos/UomDto";

export interface GetUomsParams {
  page?: number;
  limit?: number;
  classId?: string;
}

export interface IUomRepository {
  getAll(params?: GetUomsParams): Promise<Uom[]>;
  getById(id: string): Promise<Uom | null>;
  create(data: Omit<UomDto, "id">): Promise<Uom>;
  update(id: string, data: Omit<UomDto, "id">): Promise<Uom>;
  delete(id: string): Promise<void>;
}
