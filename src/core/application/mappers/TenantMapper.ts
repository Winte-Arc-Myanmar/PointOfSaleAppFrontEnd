/**
 * Tenant entity <-> DTO mappers.
 * Application layer.
 */

import type { Tenant } from "@/core/domain/entities/Tenant";
import type { TenantDto } from "../dtos/TenantDto";

export function toTenant(dto: TenantDto): Tenant {
  if (!dto.id) throw new Error("Tenant DTO must have id");
  return {
    id: dto.id,
    name: dto.name,
    legalName: dto.legalName,
    domain: dto.domain,
    website: dto.website,
    logoUrl: dto.logoUrl,
    primaryContactName: dto.primaryContactName,
    primaryContactEmail: dto.primaryContactEmail,
    primaryContactPhone: dto.primaryContactPhone,
    address: dto.address,
    city: dto.city,
    state: dto.state,
    country: dto.country,
    zipCode: dto.zipCode,
  };
}

export function toTenantDto(tenant: Partial<Tenant>): TenantDto {
  return {
    ...(tenant.id && { id: tenant.id }),
    name: tenant.name ?? "",
    legalName: tenant.legalName ?? "",
    domain: tenant.domain ?? "",
    website: tenant.website ?? "",
    logoUrl: tenant.logoUrl ?? "",
    primaryContactName: tenant.primaryContactName ?? "",
    primaryContactEmail: tenant.primaryContactEmail ?? "",
    primaryContactPhone: tenant.primaryContactPhone ?? "",
    address: tenant.address ?? "",
    city: tenant.city ?? "",
    state: tenant.state ?? "",
    country: tenant.country ?? "",
    zipCode: tenant.zipCode ?? "",
  };
}
