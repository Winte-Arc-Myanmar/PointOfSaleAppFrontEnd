/**
 * UOM service implementation.
 * Application layer - delegates to IUomRepository.
 */

import type { IUomService } from "@/core/domain/services/IUomService";
import type { IUomRepository } from "@/core/domain/repositories/IUomRepository";
import type { Uom } from "@/core/domain/entities/Uom";
import type { UomDto } from "../dtos/UomDto";
import type { GetUomsParams } from "@/core/domain/repositories/IUomRepository";

export class UomService implements IUomService {
  constructor(private readonly uomRepository: IUomRepository) {}

  async getAll(params?: GetUomsParams): Promise<Uom[]> {
    return this.uomRepository.getAll(params);
  }

  async getById(id: string): Promise<Uom | null> {
    return this.uomRepository.getById(id);
  }

  async create(data: Omit<UomDto, "id">): Promise<Uom> {
    return this.uomRepository.create(data);
  }

  async update(id: string, data: Omit<UomDto, "id">): Promise<Uom> {
    return this.uomRepository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    return this.uomRepository.delete(id);
  }
}
