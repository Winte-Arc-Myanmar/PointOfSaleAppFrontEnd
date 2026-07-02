import type {
  SectionAssignmentCreateDto,
  SectionAssignmentUpdateDto,
  SectionCreateDto,
  SectionUpdateDto,
} from "@/core/application/dtos/SectionDto";
import type { Section } from "../entities/Section";
import type { SectionAssignment } from "../entities/SectionAssignment";
import type { PaginatedResult } from "../types/pagination";

export interface GetSectionsParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc" | string;
}

export interface ISectionRepository {
  getAll(params?: GetSectionsParams): Promise<PaginatedResult<Section>>;
  getById(id: string): Promise<Section | null>;
  create(data: SectionCreateDto): Promise<Section>;
  update(id: string, data: SectionUpdateDto): Promise<Section>;
  delete(id: string): Promise<void>;
  attachTable(sectionId: string, tableId: string): Promise<void>;
  detachTable(sectionId: string, tableId: string): Promise<void>;
  listAssignments(sectionId: string): Promise<SectionAssignment[]>;
  createAssignment(
    sectionId: string,
    data: SectionAssignmentCreateDto
  ): Promise<SectionAssignment>;
  updateAssignment(
    assignmentId: string,
    data: SectionAssignmentUpdateDto
  ): Promise<SectionAssignment>;
  endAssignment(assignmentId: string): Promise<SectionAssignment>;
}
