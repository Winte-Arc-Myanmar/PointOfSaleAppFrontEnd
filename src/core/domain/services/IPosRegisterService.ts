import type { PosRegister } from "../entities/PosRegister";
import type { PosRegisterDto } from "@/core/application/dtos/PosRegisterDto";
import type { GetPosRegistersParams } from "../repositories/IPosRegisterRepository";
import type { PaginatedResult } from "../types/pagination";


export interface IPosRegisterService {
  getAll(params?: GetPosRegistersParams): Promise<PaginatedResult<PosRegister>>;
  getById(id: string): Promise<PosRegister | null>;
  create(data: Omit<PosRegisterDto, "id" | "createdAt" | "updatedAt">): Promise<PosRegister>;
  update(
    id: string,
    data: Omit<PosRegisterDto, "id" | "createdAt" | "updatedAt">
  ): Promise<PosRegister>;
  delete(id: string): Promise<void>;
}

