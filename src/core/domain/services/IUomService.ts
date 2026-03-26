/**
 * UOM service interface.
 * Domain layer - defines the contract for UOM operations.
 */

import type { Uom } from "../entities/Uom";
import type { UomDto } from "@/core/application/dtos/UomDto";
import type { GetUomsParams } from "../repositories/IUomRepository";

export interface IUomService {
  getAll(params?: GetUomsParams): Promise<Uom[]>;
  getById(id: string): Promise<Uom | null>;
  create(data: Omit<UomDto, "id">): Promise<Uom>;
  update(id: string, data: Omit<UomDto, "id">): Promise<Uom>;
  delete(id: string): Promise<void>;
}
