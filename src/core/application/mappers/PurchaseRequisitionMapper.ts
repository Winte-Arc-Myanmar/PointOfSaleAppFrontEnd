import type { PurchaseRequisition } from "@/core/domain/entities/PurchaseRequisition";
import type { PurchaseRequisitionDto } from "../dtos/PurchaseRequisitionDto";

export function toPurchaseRequisition(
  dto: PurchaseRequisitionDto & { id: string },
): PurchaseRequisition {
  return {
    id: dto.id,
    tenantId: dto.tenantId ?? "",
    requestedBy: dto.requestedBy ?? "",
    department: dto.department ?? "",
    justification: dto.justification ?? "",
    status: dto.status ?? "PENDING_APPROVAL",
    createdAt: dto.createdAt ?? null,
    updatedAt: dto.updatedAt ?? null,
  };
}

export function toPurchaseRequisitionDto(
  item: Partial<PurchaseRequisition>,
): PurchaseRequisitionDto {
  return {
    ...(item.id && { id: String(item.id) }),
    tenantId: item.tenantId ?? "",
    requestedBy: item.requestedBy ?? "",
    department: item.department ?? "",
    justification: item.justification ?? "",
  };
}
