import type {
  ModifierCreateDto,
  ModifierDto,
  ModifierGroupAttachProductDto,
  ModifierGroupCreateDto,
  ModifierGroupDto,
  ModifierGroupUpdateDto,
  ModifierUpdateDto,
} from "@/core/application/dtos/ModifierGroupDto";
import { toModifier, toModifierGroup } from "@/core/application/mappers/ModifierGroupMapper";
import type {
  Modifier,
  ModifierGroup,
} from "@/core/domain/entities/ModifierGroup";
import type {
  GetModifierGroupsParams,
  GetModifiersParams,
  IModifierGroupRepository,
} from "@/core/domain/repositories/IModifierGroupRepository";
import type { PaginatedResult } from "@/core/domain/types/pagination";
import type { HttpClient } from "@/core/infrastructure/api/HttpClient";
import { API_ENDPOINTS } from "@/core/infrastructure/api/constants";
import {
  mapPaginatedResult,
  parsePaginatedResponse,
} from "@/core/infrastructure/api/parsePaginatedResponse";

function toApiDecimalStringFixed4(value: unknown): string {
  if (typeof value === "string") {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed.toFixed(4) : "0.0000";
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return value.toFixed(4);
  }
  return "0.0000";
}

export class ApiModifierGroupRepository implements IModifierGroupRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(params?: GetModifierGroupsParams): Promise<PaginatedResult<ModifierGroup>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const { data, meta } = await this.httpClient.getPaginated<unknown>(
      API_ENDPOINTS.MODIFIER_GROUPS.LIST,
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
    const parsed = parsePaginatedResponse<ModifierGroupDto>({ data, meta }, { page, limit });
    return mapPaginatedResult(
      parsed,
      (dto) => toModifierGroup(dto as ModifierGroupDto & { id: string }),
      (dto) => !!dto?.id,
    );
  }

  async getById(id: string): Promise<ModifierGroup | null> {
    try {
      const dto = await this.httpClient.get<ModifierGroupDto>(
        API_ENDPOINTS.MODIFIER_GROUPS.BY_ID(id),
      );
      if (!dto?.id) return null;
      return toModifierGroup(dto as ModifierGroupDto & { id: string });
    } catch {
      return null;
    }
  }

  async create(data: ModifierGroupCreateDto): Promise<ModifierGroup> {
    const dto = await this.httpClient.post<ModifierGroupDto>(
      API_ENDPOINTS.MODIFIER_GROUPS.CREATE,
      data,
    );
    if (!dto?.id) throw new Error("Create modifier group response missing id");
    return toModifierGroup(dto as ModifierGroupDto & { id: string });
  }

  async update(id: string, data: ModifierGroupUpdateDto): Promise<ModifierGroup> {
    const dto = await this.httpClient.patch<ModifierGroupDto>(
      API_ENDPOINTS.MODIFIER_GROUPS.UPDATE(id),
      data,
    );
    return toModifierGroup({
      ...dto,
      id: dto?.id ?? id,
    } as ModifierGroupDto & { id: string });
  }

  async delete(id: string): Promise<void> {
    await this.httpClient.delete(API_ENDPOINTS.MODIFIER_GROUPS.DELETE(id));
  }

  async attachProduct(id: string, data: ModifierGroupAttachProductDto): Promise<void> {
    await this.httpClient.post(API_ENDPOINTS.MODIFIER_GROUPS.ATTACH_PRODUCT(id), data);
  }

  async detachProduct(id: string, productId: string): Promise<void> {
    await this.httpClient.delete(
      API_ENDPOINTS.MODIFIER_GROUPS.DETACH_PRODUCT(id, productId),
    );
  }

  async listModifiers(
    groupId: string,
    params?: GetModifiersParams,
  ): Promise<PaginatedResult<Modifier>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const { data, meta } = await this.httpClient.getPaginated<unknown>(
      API_ENDPOINTS.MODIFIER_GROUPS.MODIFIERS.LIST(groupId),
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
    const parsed = parsePaginatedResponse<ModifierDto>({ data, meta }, { page, limit });
    return mapPaginatedResult(
      parsed,
      (dto) => toModifier(dto as ModifierDto & { id: string }),
      (dto) => !!dto?.id,
    );
  }

  async getModifierById(groupId: string, id: string): Promise<Modifier | null> {
    try {
      const dto = await this.httpClient.get<ModifierDto>(
        API_ENDPOINTS.MODIFIER_GROUPS.MODIFIERS.BY_ID(groupId, id),
      );
      if (!dto?.id) return null;
      return toModifier(dto as ModifierDto & { id: string });
    } catch {
      return null;
    }
  }

  async createModifier(groupId: string, data: ModifierCreateDto): Promise<Modifier> {
    const dto = await this.httpClient.post<ModifierDto>(
      API_ENDPOINTS.MODIFIER_GROUPS.MODIFIERS.CREATE(groupId),
      {
        ...data,
        priceDelta: toApiDecimalStringFixed4(data.priceDelta),
      },
    );
    if (!dto?.id) throw new Error("Create modifier response missing id");
    return toModifier(dto as ModifierDto & { id: string });
  }

  async updateModifier(groupId: string, id: string, data: ModifierUpdateDto): Promise<Modifier> {
    const dto = await this.httpClient.patch<ModifierDto>(
      API_ENDPOINTS.MODIFIER_GROUPS.MODIFIERS.UPDATE(groupId, id),
      {
        ...data,
        priceDelta: toApiDecimalStringFixed4(data.priceDelta),
      },
    );
    return toModifier({ ...dto, id: dto?.id ?? id } as ModifierDto & { id: string });
  }

  async deleteModifier(groupId: string, id: string): Promise<void> {
    await this.httpClient.delete(API_ENDPOINTS.MODIFIER_GROUPS.MODIFIERS.DELETE(groupId, id));
  }
}
