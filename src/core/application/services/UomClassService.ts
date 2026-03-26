/**
 * UOM Class service implementation.
 * Application layer - delegates to IUomClassRepository.
 */

import type { IUomClassService } from "@/core/domain/services/IUomClassService";
import type { IUomClassRepository } from "@/core/domain/repositories/IUomClassRepository";
import type { UomClass } from "@/core/domain/entities/UomClass";
import type { UomClassDto } from "../dtos/UomClassDto";
import type { GetUomClassesParams } from "@/core/domain/repositories/IUomClassRepository";

export class UomClassService implements IUomClassService {
  constructor(private readonly uomClassRepository: IUomClassRepository) {}

  async getAll(params?: GetUomClassesParams): Promise<UomClass[]> {
    return this.uomClassRepository.getAll(params);
  }

  async getById(id: string): Promise<UomClass | null> {
    return this.uomClassRepository.getById(id);
  }

  async create(data: Omit<UomClassDto, "id">): Promise<UomClass> {
    return this.uomClassRepository.create(data);
  }

  async update(id: string, data: Omit<UomClassDto, "id">): Promise<UomClass> {
    return this.uomClassRepository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    return this.uomClassRepository.delete(id);
  }
}
