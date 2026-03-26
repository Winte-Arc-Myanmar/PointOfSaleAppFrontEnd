/**
 * UOM Class service interface.
 * Domain layer - defines the contract for UOM class operations.
 */

import type { UomClass } from "../entities/UomClass";
import type { UomClassDto } from "@/core/application/dtos/UomClassDto";
import type { GetUomClassesParams } from "../repositories/IUomClassRepository";

export interface IUomClassService {
  getAll(params?: GetUomClassesParams): Promise<UomClass[]>;
  getById(id: string): Promise<UomClass | null>;
  create(data: Omit<UomClassDto, "id">): Promise<UomClass>;
  update(id: string, data: Omit<UomClassDto, "id">): Promise<UomClass>;
  delete(id: string): Promise<void>;
}
