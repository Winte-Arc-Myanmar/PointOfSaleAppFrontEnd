import type { Section } from "@/core/domain/entities/Section";
import type { SectionAssignment } from "@/core/domain/entities/SectionAssignment";
import type { SectionAssignmentDto, SectionDto } from "../dtos/SectionDto";

export function toSection(dto: SectionDto & { id: string }): Section {
  return {
    id: dto.id,
    tenantId: dto.tenantId ?? "",
    locationId: dto.locationId ?? "",
    name: dto.name ?? "",
    color: dto.color ?? "#22C55E",
    deletedAt: dto.deletedAt ?? null,
    createdAt: dto.createdAt ?? null,
    updatedAt: dto.updatedAt ?? null,
  };
}

export function toSectionAssignment(
  dto: SectionAssignmentDto & { id: string }
): SectionAssignment {
  return {
    id: dto.id,
    sectionId: dto.sectionId ?? "",
    userId: dto.userId ?? "",
    startsAt: dto.startsAt ?? "",
    endsAt: dto.endsAt ?? null,
    notes: dto.notes ?? null,
    createdAt: dto.createdAt ?? null,
    updatedAt: dto.updatedAt ?? null,
  };
}
