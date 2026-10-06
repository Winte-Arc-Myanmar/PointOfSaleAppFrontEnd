import type { PosRegister } from "@/core/domain/entities/PosRegister";
import type { PosRegisterDto } from "../dtos/PosRegisterDto";

export function toPosRegister(dto: PosRegisterDto & { id: string }): PosRegister {
  return {
    id: dto.id,
    tenantId: dto.tenantId ?? "",
    locationId: dto.locationId ?? "",
    name: dto.name ?? "",
    macAddress: dto.macAddress ?? "",
    sellsAt: Array.isArray(dto.sellsAt) && dto.sellsAt.length ? dto.sellsAt : ["BAR", "KTV", "SPA"],
    shiftRule: dto.shiftRule === "DAILY" ? "DAILY" : "PER_LOGIN",
    checkoutPrinterIds: Array.isArray(dto.checkoutPrinterIds) ? dto.checkoutPrinterIds.map(String) : [],
    financePrinterIds: Array.isArray(dto.financePrinterIds) ? dto.financePrinterIds.map(String) : [],
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
    ...(register.sellsAt && { sellsAt: register.sellsAt }),
    ...(register.shiftRule && { shiftRule: register.shiftRule }),
  };
}

