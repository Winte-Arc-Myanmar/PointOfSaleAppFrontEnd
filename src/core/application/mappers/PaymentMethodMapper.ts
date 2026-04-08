import type { PaymentMethod } from "@/core/domain/entities/PaymentMethod";
import type { PaymentMethodDto } from "../dtos/PaymentMethodDto";

export function toPaymentMethod(dto: PaymentMethodDto & { id: string }): PaymentMethod {
  return {
    id: dto.id,
    tenantId: dto.tenantId ?? "",
    name: dto.name ?? "",
    glAccountId: dto.glAccountId ?? "",
    createdAt: dto.createdAt ?? null,
    updatedAt: dto.updatedAt ?? null,
  };
}

export function toPaymentMethodDto(method: Partial<PaymentMethod>): PaymentMethodDto {
  return {
    ...(method.id && { id: String(method.id) }),
    tenantId: method.tenantId ?? "",
    name: method.name ?? "",
    glAccountId: method.glAccountId ?? "",
  };
}

