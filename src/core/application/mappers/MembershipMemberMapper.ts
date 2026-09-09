import type { MembershipMember } from "@/core/domain/entities/MembershipMember";
import type { MembershipMemberDto } from "../dtos/MembershipMemberDto";

function parseDecimal(val: unknown): number {
  if (typeof val === "number" && Number.isFinite(val)) return val;
  if (typeof val === "string") {
    const n = Number(val.trim());
    return Number.isFinite(n) ? n : 0;
  }
  return Number(val) || 0;
}

export function toMembershipMember(
  dto: MembershipMemberDto & { id: string },
): MembershipMember {
  return {
    id: dto.id,
    tenantId: dto.tenantId ?? "",
    customerId: dto.customerId ?? dto.customer?.id ?? "",
    customerName: dto.customerName ?? dto.customer?.name ?? "",
    phone: dto.phone ?? dto.customer?.phone ?? "",
    email: dto.email ?? dto.customer?.email ?? "",
    cardTemplateId: dto.cardTemplateId ?? dto.cardTemplate?.id ?? "",
    cardTemplateName: dto.cardTemplateName ?? dto.cardTemplate?.name ?? "",
    tier: dto.tier ?? dto.cardTemplate?.tier ?? "BRONZE",
    cardNumber: dto.cardNumber ?? null,
    cardBindStatus: dto.cardBindStatus ?? (dto.cardNumber ? "BOUND" : "UNBOUND"),
    walletBalance: parseDecimal(dto.walletBalance),
    status: dto.status ?? "ACTIVE",
    registeredAt: dto.registeredAt ?? dto.createdAt ?? new Date().toISOString(),
    closedAt: dto.closedAt ?? null,
    createdAt: dto.createdAt ?? null,
    updatedAt: dto.updatedAt ?? null,
  };
}
