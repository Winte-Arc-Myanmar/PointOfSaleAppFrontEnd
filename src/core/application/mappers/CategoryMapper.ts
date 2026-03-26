/**
 * Category entity <-> DTO mappers.
 * Application layer.
 */

import type { Category } from "@/core/domain/entities/Category";
import type { CategoryDto } from "../dtos/CategoryDto";

function mapOne(dto: CategoryDto & { id: string }): Category {
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
          .filter((c): c is CategoryDto & { id: string } => !!c?.id)
          .map(mapOne)
      : undefined,
  };
}

export function toCategory(dto: CategoryDto & { id: string }): Category {
  return mapOne(dto);
}

export function toCategoryDto(category: Partial<Category>): CategoryDto {
  return {
    ...(category.id && { id: category.id }),
    name: category.name ?? "",
    tenantId: category.tenantId ?? "",
    parentId: category.parentId ?? undefined,
    description: category.description ?? "",
    sortOrder: category.sortOrder ?? 0,
  };
}
