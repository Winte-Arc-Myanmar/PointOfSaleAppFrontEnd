import type { DiscountReasonDto } from "@/core/application/dtos/DiscountReasonDto";
import type { DiscountReason } from "@/core/domain/entities/DiscountReason";

export function toDiscountReason(dto: DiscountReasonDto & { id: string }): DiscountReason {
  return {
    id: dto.id,
    tenantId: dto.tenantId ?? "",
    code: dto.code ?? "",
    name: dto.name ?? "",
    description: dto.description ?? "",
    isActive: Boolean(dto.isActive),
    requiresManagerOverride: Boolean(dto.requiresManagerOverride),
    deletedAt: dto.deletedAt ?? null,
    createdAt: dto.createdAt ?? null,
    updatedAt: dto.updatedAt ?? null,
  };
}
