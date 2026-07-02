import type {
  SectionAssignmentCreateDto,
  SectionAssignmentUpdateDto,
  SectionCreateDto,
  SectionUpdateDto,
} from "@/core/application/dtos/SectionDto";
import type { Section } from "@/core/domain/entities/Section";
import type { SectionAssignment } from "@/core/domain/entities/SectionAssignment";
import type {
  GetSectionsParams,
  ISectionRepository,
} from "@/core/domain/repositories/ISectionRepository";
import type { ISectionService } from "@/core/domain/services/ISectionService";
import type { PaginatedResult } from "@/core/domain/types/pagination";

export class SectionService implements ISectionService {
  constructor(private readonly sectionRepository: ISectionRepository) {}

  getAll(params?: GetSectionsParams): Promise<PaginatedResult<Section>> {
    return this.sectionRepository.getAll(params);
  }

  getById(id: string): Promise<Section | null> {
    return this.sectionRepository.getById(id);
  }

  create(data: SectionCreateDto): Promise<Section> {
    return this.sectionRepository.create(data);
  }

  update(id: string, data: SectionUpdateDto): Promise<Section> {
    return this.sectionRepository.update(id, data);
  }

  delete(id: string): Promise<void> {
    return this.sectionRepository.delete(id);
  }

  attachTable(sectionId: string, tableId: string): Promise<void> {
    return this.sectionRepository.attachTable(sectionId, tableId);
  }

  detachTable(sectionId: string, tableId: string): Promise<void> {
    return this.sectionRepository.detachTable(sectionId, tableId);
  }

  listAssignments(sectionId: string): Promise<SectionAssignment[]> {
    return this.sectionRepository.listAssignments(sectionId);
  }

  createAssignment(
    sectionId: string,
    data: SectionAssignmentCreateDto
  ): Promise<SectionAssignment> {
    return this.sectionRepository.createAssignment(sectionId, data);
  }

  updateAssignment(
    assignmentId: string,
    data: SectionAssignmentUpdateDto
  ): Promise<SectionAssignment> {
    return this.sectionRepository.updateAssignment(assignmentId, data);
  }

  endAssignment(assignmentId: string): Promise<SectionAssignment> {
    return this.sectionRepository.endAssignment(assignmentId);
  }
}
