import type { PosRegister } from "../entities/PosRegister";
import type { PosRegisterDto } from "@/core/application/dtos/PosRegisterDto";

export interface GetPosRegistersParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc" | string;
}

export interface IPosRegisterRepository {
  getAll(params?: GetPosRegistersParams): Promise<PosRegister[]>;
  getById(id: string): Promise<PosRegister | null>;
  create(data: Omit<PosRegisterDto, "id" | "createdAt" | "updatedAt">): Promise<PosRegister>;
  update(
    id: string,
    data: Omit<PosRegisterDto, "id" | "createdAt" | "updatedAt">
  ): Promise<PosRegister>;
  delete(id: string): Promise<void>;
}

