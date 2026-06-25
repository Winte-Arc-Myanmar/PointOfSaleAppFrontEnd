/**
 * UOM Class repository 
 * Infrastructure layer.
 */

import type {
  IUomClassRepository,
  GetUomClassesParams,
} from "@/core/domain/repositories/IUomClassRepository";
import type { UomClass } from "@/core/domain/entities/UomClass";
import type { UomClassDto } from "@/core/application/dtos/UomClassDto";
import { toUomClass } from "@/core/application/mappers/UomClassMapper";
import type { PaginatedResult } from "@/core/domain/types/pagination";
import type { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";
import {
  mapPaginatedResult,
  parsePaginatedResponse,
} from "../api/parsePaginatedResponse";

export class ApiUomClassRepository implements IUomClassRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(params?: GetUomClassesParams): Promise<PaginatedResult<UomClass>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const { data, meta } = await this.httpClient.getPaginated<unknown>(API_ENDPOINTS.UOM_CLASSES.LIST, {
      params: { page, limit },
    });
    const parsed = parsePaginatedResponse<UomClassDto>({ data, meta }, { page, limit });
    return mapPaginatedResult(
      parsed,
      (dto) => toUomClass(dto as UomClassDto & { id: string }),
      (dto) => !!dto?.id,
    );
  }

  async getById(id: string): Promise<UomClass | null> {
    try {
      const dto = await this.httpClient.get<UomClassDto>(
        API_ENDPOINTS.UOM_CLASSES.BY_ID(id)
      );
      if (!dto?.id) return null;
      return toUomClass(dto as UomClassDto & { id: string });
    } catch {
      return null;
    }
  }

  async create(data: Omit<UomClassDto, "id">): Promise<UomClass> {
    const dto = await this.httpClient.post<UomClassDto>(
      API_ENDPOINTS.UOM_CLASSES.CREATE,
      data
    );
    if (!dto?.id) throw new Error("Create UOM class response missing id");
    return toUomClass(dto as UomClassDto & { id: string });
  }

  async update(id: string, data: Omit<UomClassDto, "id">): Promise<UomClass> {
    const dto = await this.httpClient.patch<UomClassDto>(
      API_ENDPOINTS.UOM_CLASSES.UPDATE(id),
      data
    );
    return toUomClass({ ...dto, id: dto?.id ?? id } as UomClassDto & {
      id: string;
    });
  }

  async delete(id: string): Promise<void> {
    await this.httpClient.delete(API_ENDPOINTS.UOM_CLASSES.DELETE(id));
  }
}


