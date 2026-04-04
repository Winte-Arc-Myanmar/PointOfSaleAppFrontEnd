/**
 * Vendor entity <-> DTO mappers.
 * Application layer.
 */

import type { Vendor } from "@/core/domain/entities/Vendor";
import type { VendorDto } from "../dtos/VendorDto";

export function toVendor(dto: VendorDto & { id: string }): Vendor {
  return {
    id: dto.id,
    tenantId: dto.tenantId ?? "",
    name: dto.name ?? "",
    createdAt: dto.createdAt ?? null,
    updatedAt: dto.updatedAt ?? null,
  };
}

export function toVendorDto(vendor: Partial<Vendor>): VendorDto {
  return {
    ...(vendor.id && { id: String(vendor.id) }),
    tenantId: vendor.tenantId ?? "",
    name: vendor.name ?? "",
    ...(vendor.createdAt && { createdAt: vendor.createdAt }),
    ...(vendor.updatedAt && { updatedAt: vendor.updatedAt }),
  };
}

