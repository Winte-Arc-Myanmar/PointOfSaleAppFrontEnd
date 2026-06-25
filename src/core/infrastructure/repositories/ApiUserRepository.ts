/**
 * User repository - CRUD via external API.
 * Infrastructure layer.
 */

import type { IUserRepository, GetUsersParams } from "@/core/domain/repositories/IUserRepository";
import type { AppUser } from "@/core/domain/entities/AppUser";
import type { UserDto, UserUpdateDto } from "@/core/application/dtos/UserDto";
import { toAppUser } from "@/core/application/mappers/UserMapper";
import type { PaginatedResult } from "@/core/domain/types/pagination";
import type { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";
import {
  mapPaginatedResult,
  parsePaginatedResponse,
} from "../api/parsePaginatedResponse";

export class ApiUserRepository implements IUserRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(params?: GetUsersParams): Promise<PaginatedResult<AppUser>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const { data, meta } = await this.httpClient.getPaginated<unknown>(API_ENDPOINTS.USERS.LIST, {
      params: { page, limit },
    });
    const parsed = parsePaginatedResponse<UserDto>({ data, meta }, { page, limit });
    return mapPaginatedResult(
      parsed,
      (dto) => toAppUser(dto as UserDto & { id: string }),
      (dto) => !!dto?.id,
    );
  }

  async getById(id: string): Promise<AppUser | null> {
    try {
      const dto = await this.httpClient.get<UserDto>(
        API_ENDPOINTS.USERS.BY_ID(id)
      );
      if (!dto?.id) return null;
      return toAppUser(dto as UserDto & { id: string });
    } catch {
      return null;
    }
  }

  async create(data: Omit<UserDto, "id">): Promise<AppUser> {
    const dto = await this.httpClient.post<UserDto>(
      API_ENDPOINTS.USERS.CREATE,
      data
    );
    if (!dto?.id) throw new Error("Create user response missing id");
    return toAppUser(dto as UserDto & { id: string });
  }

  async update(id: string, data: UserUpdateDto): Promise<AppUser> {
    const dto = await this.httpClient.patch<UserDto>(
      API_ENDPOINTS.USERS.UPDATE(id),
      data
    );
    return toAppUser({ ...dto, id: dto?.id ?? id } as UserDto & { id: string });
  }

  async delete(id: string): Promise<void> {
    await this.httpClient.delete(API_ENDPOINTS.USERS.DELETE(id));
  }
}


