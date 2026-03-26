/**
 * User repository - CRUD via external API.
 * Infrastructure layer.
 */

import type { IUserRepository, GetUsersParams } from "@/core/domain/repositories/IUserRepository";
import type { AppUser } from "@/core/domain/entities/AppUser";
import type { UserDto, UserUpdateDto } from "@/core/application/dtos/UserDto";
import { toAppUser } from "@/core/application/mappers/UserMapper";
import type { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";

export class ApiUserRepository implements IUserRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async getAll(params?: GetUsersParams): Promise<AppUser[]> {
    const query = {
      page: params?.page ?? 1,
      limit: params?.limit ?? 10,
    };
    const res = await this.httpClient.get<UserDto[] | { data?: UserDto[] }>(
      API_ENDPOINTS.USERS.LIST,
      { params: query }
    );
    const list = Array.isArray(res) ? res : res?.data ?? [];
    const dtos = Array.isArray(list) ? list : [];
    return dtos
      .filter((dto): dto is UserDto & { id: string } => !!dto?.id)
      .map(toAppUser);
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
