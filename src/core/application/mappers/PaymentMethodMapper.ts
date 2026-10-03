import {
  PAYMENT_METHOD_KINDS,
  type PaymentMethod,
  type PaymentMethodKind,
} from "@/core/domain/entities/PaymentMethod";
import type { PaymentMethodDto } from "../dtos/PaymentMethodDto";

export function toPaymentMethod(dto: PaymentMethodDto & { id: string }): PaymentMethod {
  return {
    id: dto.id,
    tenantId: dto.tenantId ?? "",
    name: dto.name ?? "",
    kind: PAYMENT_METHOD_KINDS.includes(dto.kind as PaymentMethodKind)
      ? (dto.kind as PaymentMethodKind)
      : "OTHER",
    isActive: dto.isActive !== false,
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
    kind: method.kind,
    isActive: method.isActive,
    glAccountId: method.glAccountId || null,
  };
}

