/**
 * Membership card template entity <-> DTO mappers.
 * Application layer.
 */

import type { MembershipCardTemplate } from "@/core/domain/entities/MembershipCardTemplate";
import type { MembershipCardTemplateDto } from "../dtos/MembershipCardTemplateDto";

function parseDecimal(val: unknown): number {
  if (typeof val === "number" && Number.isFinite(val)) return val;
  if (
    val != null &&
    typeof val === "object" &&
    "s" in val &&
    "e" in val &&
    "d" in val
  ) {
    const { s, e, d } = val as { s: number; e: number; d: number[] };
    if (!Array.isArray(d)) return 0;
    let n = 0;
    for (let i = 0; i < d.length; i++) {
      n += d[i] * Math.pow(10, e - i * 7);
    }
    return s * n;
  }
  if (typeof val === "string") {
    const n = Number(val.trim());
    return Number.isFinite(n) ? n : 0;
  }
  return Number(val) || 0;
}

type MembershipCardTemplateDtoRaw = Omit<MembershipCardTemplateDto, "amount"> & {
  id: string;
  amount?: unknown;
  durationMonths?: unknown;
};

export function toMembershipCardTemplate(
  dto: MembershipCardTemplateDtoRaw,
): MembershipCardTemplate {
  const durationRaw = dto.durationMonths;
  const durationParsed =
    durationRaw == null || durationRaw === ""
      ? null
      : Number(durationRaw);

  return {
    id: dto.id,
    tenantId: dto.tenantId ?? "",
    categoryId: dto.categoryId ?? dto.category?.id ?? "",
    categoryName: dto.category?.name,
    name: dto.name ?? "",
    tier: dto.tier ?? "BRONZE",
    amount: parseDecimal(dto.amount),
    billingPeriod: dto.billingPeriod ?? "MONTHLY",
    durationMonths:
      durationParsed != null && Number.isFinite(durationParsed)
        ? durationParsed
        : null,
    rules: dto.rules ?? "",
    benefits: dto.benefits ?? "",
    isActive: dto.isActive !== false,
    deletedAt: dto.deletedAt ?? null,
    createdAt: dto.createdAt ?? null,
    updatedAt: dto.updatedAt ?? null,
  };
}

export function toMembershipCardTemplateDto(
  template: Partial<MembershipCardTemplate>,
): MembershipCardTemplateDto {
  return {
    ...(template.id && { id: String(template.id) }),
    tenantId: template.tenantId ?? "",
    categoryId: template.categoryId ?? "",
    name: template.name ?? "",
    tier: template.tier ?? "BRONZE",
    amount: template.amount ?? 0,
    billingPeriod: template.billingPeriod ?? "MONTHLY",
    durationMonths: template.durationMonths ?? null,
    rules: template.rules ?? "",
    benefits: template.benefits ?? "",
    isActive: template.isActive ?? true,
  };
}
