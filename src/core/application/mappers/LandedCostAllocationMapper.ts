import type { LandedCostAllocation } from "@/core/domain/entities/LandedCostAllocation";
import type { LandedCostAllocationDto } from "../dtos/LandedCostAllocationDto";

export function toLandedCostAllocation(
  dto: LandedCostAllocationDto & { id: string },
): LandedCostAllocation {
  return {
    id: dto.id,
    tenantId: dto.tenantId ?? "",
    sourceInvoiceId: dto.sourceInvoiceId ?? "",
    targetGrnId: dto.targetGrnId ?? "",
    targetGrnLineId: dto.targetGrnLineId ?? "",
    allocationMethod: dto.allocationMethod ?? "BY_VALUE",
    allocatedAmount: dto.allocatedAmount ?? "0.00",
    glJournalPosted: Boolean(dto.glJournalPosted),
    createdAt: dto.createdAt ?? null,
    updatedAt: dto.updatedAt ?? null,
  };
}

export function toLandedCostAllocationDto(
  item: Partial<LandedCostAllocation>,
): LandedCostAllocationDto {
  return {
    ...(item.id && { id: String(item.id) }),
    tenantId: item.tenantId ?? "",
    sourceInvoiceId: item.sourceInvoiceId ?? "",
    targetGrnId: item.targetGrnId ?? "",
    targetGrnLineId: item.targetGrnLineId ?? "",
    allocationMethod: item.allocationMethod ?? "BY_VALUE",
    allocatedAmount: item.allocatedAmount ?? "0.00",
    glJournalPosted: Boolean(item.glJournalPosted),
  };
}
