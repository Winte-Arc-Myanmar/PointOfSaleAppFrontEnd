import type { VoidReasonDto } from "@/core/application/dtos/VoidReasonDto";
import type { VoidReason } from "@/core/domain/entities/VoidReason";

export function toVoidReason(dto: VoidReasonDto & { id: string }): VoidReason {
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
