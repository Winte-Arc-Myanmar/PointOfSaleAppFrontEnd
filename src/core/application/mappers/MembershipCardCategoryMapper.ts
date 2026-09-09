/**
 * Membership card category entity <-> DTO mappers.
 * Application layer.
 */

import type { MembershipCardCategory } from "@/core/domain/entities/MembershipCardCategory";
import type { MembershipCardCategoryDto } from "../dtos/MembershipCardCategoryDto";

function mapOne(
  dto: MembershipCardCategoryDto & { id: string },
): MembershipCardCategory {
  return {
    id: dto.id,
    name: dto.name ?? "",
    tenantId: dto.tenantId ?? "",
    parentId: dto.parentId ?? null,
    description: dto.description ?? "",
    sortOrder: typeof dto.sortOrder === "number" ? dto.sortOrder : 0,
    deletedAt: dto.deletedAt ?? null,
    createdAt: dto.createdAt ?? null,
    updatedAt: dto.updatedAt ?? null,
    children: Array.isArray(dto.children)
      ? dto.children
          .filter(
            (c): c is MembershipCardCategoryDto & { id: string } => !!c?.id,
          )
          .map(mapOne)
      : undefined,
  };
}

export function toMembershipCardCategory(
  dto: MembershipCardCategoryDto & { id: string },
): MembershipCardCategory {
  return mapOne(dto);
}

export function toMembershipCardCategoryDto(
  category: Partial<MembershipCardCategory>,
): MembershipCardCategoryDto {
  return {
    ...(category.id && { id: category.id }),
    name: category.name ?? "",
    tenantId: category.tenantId ?? "",
    parentId: category.parentId ?? undefined,
    description: category.description ?? "",
    sortOrder: category.sortOrder ?? 0,
  };
}
