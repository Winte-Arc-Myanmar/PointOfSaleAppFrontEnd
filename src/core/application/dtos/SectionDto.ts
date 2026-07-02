export interface SectionDto {
  id?: string;
  tenantId: string;
  locationId: string;
  name: string;
  color: string;
  deletedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface SectionAssignmentDto {
  id?: string;
  sectionId: string;
  userId: string;
  startsAt: string;
  endsAt?: string | null;
  notes?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export type SectionCreateDto = Pick<
  SectionDto,
  "tenantId" | "locationId" | "name" | "color"
>;

export type SectionUpdateDto = Pick<SectionDto, "locationId" | "name" | "color">;

export type SectionAttachTableDto = {
  tableId: string;
};

export type SectionAssignmentCreateDto = Pick<
  SectionAssignmentDto,
  "userId" | "startsAt" | "endsAt" | "notes"
>;

export type SectionAssignmentUpdateDto = Pick<
  SectionAssignmentDto,
  "endsAt" | "notes"
>;
