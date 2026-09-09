import type {
  GetMembershipCardCategoriesParams,
  IMembershipCardCategoryRepository,
} from "@/core/domain/repositories/IMembershipCardCategoryRepository";
import type { MembershipCardCategory } from "@/core/domain/entities/MembershipCardCategory";
import type { MembershipCardCategoryDto } from "@/core/application/dtos/MembershipCardCategoryDto";
import { toMembershipCardCategory } from "@/core/application/mappers/MembershipCardCategoryMapper";
import type { PaginatedResult } from "@/core/domain/types/pagination";
import type { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";
import {
  mapPaginatedResult,
  parsePaginatedResponse,
} from "../api/parsePaginatedResponse";

export class ApiMembershipCardCategoryRepository
  implements IMembershipCardCategoryRepository
{
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(
    params?: GetMembershipCardCategoriesParams,
  ): Promise<PaginatedResult<MembershipCardCategory>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const { data, meta } = await this.httpClient.getPaginated<unknown>(
      API_ENDPOINTS.MEMBERSHIP_CARD_CATEGORIES.LIST,
      { params: { page, limit } },
    );
    const parsed = parsePaginatedResponse<MembershipCardCategoryDto>(
      { data, meta },
      { page, limit },
    );
    return mapPaginatedResult(
      parsed,
      (dto) =>
        toMembershipCardCategory(dto as MembershipCardCategoryDto & { id: string }),
      (dto) => !!dto?.id,
    );
  }

  async getTree(): Promise<MembershipCardCategory[]> {
    const res = await this.httpClient.get<
      MembershipCardCategoryDto[] | { data?: MembershipCardCategoryDto[] }
    >(API_ENDPOINTS.MEMBERSHIP_CARD_CATEGORIES.TREE);
    const list = Array.isArray(res) ? res : res?.data ?? [];
    const dtos = (Array.isArray(list) ? list : []).filter(
      (d): d is MembershipCardCategoryDto & { id: string } => !!d?.id,
    );
    return dtos.map(toMembershipCardCategory);
  }

  async getById(id: string): Promise<MembershipCardCategory | null> {
    try {
      const dto = await this.httpClient.get<MembershipCardCategoryDto>(
        API_ENDPOINTS.MEMBERSHIP_CARD_CATEGORIES.BY_ID(id),
      );
      if (!dto?.id) return null;
      return toMembershipCardCategory(dto as MembershipCardCategoryDto & { id: string });
    } catch {
      return null;
    }
  }

  async create(
    data: Omit<MembershipCardCategoryDto, "id">,
  ): Promise<MembershipCardCategory> {
    const dto = await this.httpClient.post<MembershipCardCategoryDto>(
      API_ENDPOINTS.MEMBERSHIP_CARD_CATEGORIES.CREATE,
      data,
    );
    if (!dto?.id) {
      throw new Error("Create membership card category response missing id");
    }
    return toMembershipCardCategory(dto as MembershipCardCategoryDto & { id: string });
  }

  async update(
    id: string,
    data: Omit<MembershipCardCategoryDto, "id">,
  ): Promise<MembershipCardCategory> {
    const dto = await this.httpClient.patch<MembershipCardCategoryDto>(
      API_ENDPOINTS.MEMBERSHIP_CARD_CATEGORIES.UPDATE(id),
      data,
    );
    return toMembershipCardCategory({
      ...dto,
      id: dto?.id ?? id,
    } as MembershipCardCategoryDto & { id: string });
  }

  async delete(id: string): Promise<void> {
    await this.httpClient.delete(API_ENDPOINTS.MEMBERSHIP_CARD_CATEGORIES.DELETE(id));
  }
}
