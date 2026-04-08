import type { PosRegister } from "@/core/domain/entities/PosRegister";
import type { PosRegisterDto } from "../dtos/PosRegisterDto";

export function toPosRegister(dto: PosRegisterDto & { id: string }): PosRegister {
  return {
    id: dto.id,
    tenantId: dto.tenantId ?? "",
    locationId: dto.locationId ?? "",
    name: dto.name ?? "",
    macAddress: dto.macAddress ?? "",
    createdAt: dto.createdAt ?? null,
    updatedAt: dto.updatedAt ?? null,
  };
}

export function toPosRegisterDto(register: Partial<PosRegister>): PosRegisterDto {
  return {
    ...(register.id && { id: register.id }),
    tenantId: register.tenantId ?? "",
    locationId: register.locationId ?? "",
    name: register.name ?? "",
    macAddress: register.macAddress ?? "",
  };
}

