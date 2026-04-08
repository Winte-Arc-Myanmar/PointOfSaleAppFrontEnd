import type { IPosRegisterService } from "@/core/domain/services/IPosRegisterService";
import type { IPosRegisterRepository } from "@/core/domain/repositories/IPosRegisterRepository";
import type { GetPosRegistersParams } from "@/core/domain/repositories/IPosRegisterRepository";
import type { PosRegister } from "@/core/domain/entities/PosRegister";
import type { PosRegisterDto } from "../dtos/PosRegisterDto";

export class PosRegisterService implements IPosRegisterService {
  constructor(private readonly posRegisterRepository: IPosRegisterRepository) {}

  getAll(params?: GetPosRegistersParams): Promise<PosRegister[]> {
    return this.posRegisterRepository.getAll(params);
  }

  getById(id: string): Promise<PosRegister | null> {
    return this.posRegisterRepository.getById(id);
  }

  create(
    data: Omit<PosRegisterDto, "id" | "createdAt" | "updatedAt">
  ): Promise<PosRegister> {
    return this.posRegisterRepository.create(data);
  }

  update(
    id: string,
    data: Omit<PosRegisterDto, "id" | "createdAt" | "updatedAt">
  ): Promise<PosRegister> {
    return this.posRegisterRepository.update(id, data);
  }

  delete(id: string): Promise<void> {
    return this.posRegisterRepository.delete(id);
  }
}

