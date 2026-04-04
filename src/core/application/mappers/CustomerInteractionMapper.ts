/**
 * Customer interaction entity <-> DTO mappers.
 * Application layer.
 */

import type { CustomerInteraction } from "@/core/domain/entities/CustomerInteraction";
import type { CustomerInteractionDto } from "../dtos/CustomerInteractionDto";

export function toCustomerInteraction(
  dto: CustomerInteractionDto & { id: string },
  fallbackCustomerId: string
): CustomerInteraction {
  return {
    id: dto.id,
    tenantId: dto.tenantId ?? "",
    customerId: dto.customerId ?? fallbackCustomerId,
    agentId: dto.agentId ?? "",
    interactionChannel: dto.interactionChannel ?? "EMAIL",
    interactionType: dto.interactionType ?? "INQUIRY",
    summary: dto.summary ?? "",
    detailedNotes: dto.detailedNotes ?? "",
    externalReferenceId:
      dto.externalReferenceId != null && dto.externalReferenceId !== ""
        ? dto.externalReferenceId
        : null,
    interactionDate: dto.interactionDate ?? null,
    updatedAt: dto.updatedAt ?? null,
  };
}
