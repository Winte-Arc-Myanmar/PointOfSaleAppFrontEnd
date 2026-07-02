import type {
  GetSectionsParams,
  ISectionRepository,
} from "@/core/domain/repositories/ISectionRepository";
import type { Section } from "@/core/domain/entities/Section";
import type { SectionAssignment } from "@/core/domain/entities/SectionAssignment";
import type {
  SectionAssignmentCreateDto,
  SectionAssignmentDto,
  SectionAssignmentUpdateDto,
  SectionDto,
  SectionCreateDto,
  SectionUpdateDto,
} from "@/core/application/dtos/SectionDto";
import { toSection, toSectionAssignment } from "@/core/application/mappers/SectionMapper";
import type { PaginatedResult } from "@/core/domain/types/pagination";
import type { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";
import { mapPaginatedResult, parsePaginatedResponse } from "../api/parsePaginatedResponse";

export class ApiSectionRepository implements ISectionRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(params?: GetSectionsParams): Promise<PaginatedResult<Section>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const { data, meta } = await this.httpClient.getPaginated<unknown>(
      API_ENDPOINTS.SECTIONS.LIST,
      {
        params: {
          page,
          limit,
          ...(params?.search ? { search: params.search } : {}),
          ...(params?.sortBy ? { sortBy: params.sortBy } : {}),
          ...(params?.sortOrder ? { sortOrder: params.sortOrder } : {}),
        },
      }
    );
    const parsed = parsePaginatedResponse<SectionDto>({ data, meta }, { page, limit });
    return mapPaginatedResult(
      parsed,
      (dto) => toSection(dto as SectionDto & { id: string }),
      (dto) => !!dto?.id
    );
  }

  async getById(id: string): Promise<Section | null> {
    try {
      const dto = await this.httpClient.get<SectionDto>(API_ENDPOINTS.SECTIONS.BY_ID(id));
      if (!dto?.id) return null;
      return toSection(dto as SectionDto & { id: string });
    } catch {
      return null;
    }
  }

  async create(data: SectionCreateDto): Promise<Section> {
    const dto = await this.httpClient.post<SectionDto>(API_ENDPOINTS.SECTIONS.CREATE, data);
    if (!dto?.id) throw new Error("Create section response missing id");
    return toSection(dto as SectionDto & { id: string });
  }

  async update(id: string, data: SectionUpdateDto): Promise<Section> {
    const dto = await this.httpClient.patch<SectionDto>(
      API_ENDPOINTS.SECTIONS.UPDATE(id),
      data
    );
    return toSection({ ...dto, id: dto?.id ?? id } as SectionDto & { id: string });
  }

  async delete(id: string): Promise<void> {
    await this.httpClient.delete(API_ENDPOINTS.SECTIONS.DELETE(id));
  }

  async attachTable(sectionId: string, tableId: string): Promise<void> {
    await this.httpClient.post(API_ENDPOINTS.SECTIONS.TABLES.ATTACH(sectionId), { tableId });
  }

  async detachTable(sectionId: string, tableId: string): Promise<void> {
    await this.httpClient.delete(API_ENDPOINTS.SECTIONS.TABLES.DETACH(sectionId, tableId));
  }

  async listAssignments(sectionId: string): Promise<SectionAssignment[]> {
    const { data } = await this.httpClient.getPaginated<unknown>(
      API_ENDPOINTS.SECTIONS.ASSIGNMENTS.LIST(sectionId)
    );
    const payload = Array.isArray(data) ? data : [data];
    const rows = payload.filter((item) => !!(item as { id?: string })?.id);
    return rows.map((item) =>
      toSectionAssignment(item as SectionAssignmentDto & { id: string })
    );
  }

  async createAssignment(
    sectionId: string,
    data: SectionAssignmentCreateDto
  ): Promise<SectionAssignment> {
    const dto = await this.httpClient.post<SectionAssignmentDto>(
      API_ENDPOINTS.SECTIONS.ASSIGNMENTS.CREATE(sectionId),
      data
    );
    if (!dto?.id) throw new Error("Create assignment response missing id");
    return toSectionAssignment(dto as SectionAssignmentDto & { id: string });
  }

  async updateAssignment(
    assignmentId: string,
    data: SectionAssignmentUpdateDto
  ): Promise<SectionAssignment> {
    const dto = await this.httpClient.patch<SectionAssignmentDto>(
      API_ENDPOINTS.SECTIONS.ASSIGNMENTS.UPDATE(assignmentId),
      data
    );
    return toSectionAssignment({
      ...dto,
      id: dto?.id ?? assignmentId,
    } as SectionAssignmentDto & { id: string });
  }

  async endAssignment(assignmentId: string): Promise<SectionAssignment> {
    const dto = await this.httpClient.post<SectionAssignmentDto>(
      API_ENDPOINTS.SECTIONS.ASSIGNMENTS.END(assignmentId)
    );
    return toSectionAssignment({
      ...dto,
      id: dto?.id ?? assignmentId,
    } as SectionAssignmentDto & { id: string });
  }
}
