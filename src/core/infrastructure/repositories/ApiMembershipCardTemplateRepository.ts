import type {
  GetMembershipCardTemplatesParams,
  IMembershipCardTemplateRepository,
} from "@/core/domain/repositories/IMembershipCardTemplateRepository";
import type { MembershipCardTemplate } from "@/core/domain/entities/MembershipCardTemplate";
import type { MembershipCardTemplateDto } from "@/core/application/dtos/MembershipCardTemplateDto";
import { toMembershipCardTemplate } from "@/core/application/mappers/MembershipCardTemplateMapper";
import type { PaginatedResult } from "@/core/domain/types/pagination";
import type { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";
import {
  mapPaginatedResult,
  parsePaginatedResponse,
} from "../api/parsePaginatedResponse";

function toApiDecimalStringFixed4(value: unknown): string {
  let n: number;
  if (typeof value === "number" && Number.isFinite(value)) n = value;
  else if (typeof value === "string") n = value.trim() ? Number(value.trim()) : 0;
  else n = NaN;
  if (!Number.isFinite(n)) return "0.0000";
  return n.toFixed(4);
}

function normalizeWritePayload(
  data: Omit<MembershipCardTemplateDto, "id" | "createdAt" | "updatedAt" | "deletedAt">,
): Record<string, unknown> {
  return {
    ...data,
    amount: toApiDecimalStringFixed4(data.amount),
  };
}

export class ApiMembershipCardTemplateRepository
  implements IMembershipCardTemplateRepository
{
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(
    params?: GetMembershipCardTemplatesParams,
  ): Promise<PaginatedResult<MembershipCardTemplate>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const { data, meta } = await this.httpClient.getPaginated<unknown>(
      API_ENDPOINTS.MEMBERSHIP_CARD_TEMPLATES.LIST,
      {
        params: {
          page,
          limit,
          ...(params?.search ? { search: params.search } : {}),
          ...(params?.sortBy ? { sortBy: params.sortBy } : {}),
          ...(params?.sortOrder ? { sortOrder: params.sortOrder } : {}),
        },
      },
    );
    const parsed = parsePaginatedResponse<MembershipCardTemplateDto>(
      { data, meta },
      { page, limit },
    );
    return mapPaginatedResult(
      parsed,
      (dto) => toMembershipCardTemplate(dto as MembershipCardTemplateDto & { id: string }),
      (dto) => !!dto?.id,
    );
  }

  async getById(id: string): Promise<MembershipCardTemplate | null> {
    try {
      const dto = await this.httpClient.get<MembershipCardTemplateDto>(
        API_ENDPOINTS.MEMBERSHIP_CARD_TEMPLATES.BY_ID(id),
      );
      if (!dto?.id) return null;
      return toMembershipCardTemplate(dto as MembershipCardTemplateDto & { id: string });
    } catch {
      return null;
    }
  }

  async create(
    data: Omit<MembershipCardTemplateDto, "id" | "createdAt" | "updatedAt" | "deletedAt">,
  ): Promise<MembershipCardTemplate> {
    const dto = await this.httpClient.post<MembershipCardTemplateDto>(
      API_ENDPOINTS.MEMBERSHIP_CARD_TEMPLATES.CREATE,
      normalizeWritePayload(data),
    );
    if (!dto?.id) throw new Error("Create membership card template response missing id");
    return toMembershipCardTemplate(dto as MembershipCardTemplateDto & { id: string });
  }

  async update(
    id: string,
    data: Omit<MembershipCardTemplateDto, "id" | "createdAt" | "updatedAt" | "deletedAt">,
  ): Promise<MembershipCardTemplate> {
    const dto = await this.httpClient.patch<MembershipCardTemplateDto>(
      API_ENDPOINTS.MEMBERSHIP_CARD_TEMPLATES.UPDATE(id),
      normalizeWritePayload(data),
    );
    return toMembershipCardTemplate({
      ...dto,
      id: dto?.id ?? id,
    } as MembershipCardTemplateDto & { id: string });
  }

  async delete(id: string): Promise<void> {
    await this.httpClient.delete(API_ENDPOINTS.MEMBERSHIP_CARD_TEMPLATES.DELETE(id));
  }
}
