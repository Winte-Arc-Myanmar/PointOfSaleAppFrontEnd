/**
 * User repository interface.
 * Domain layer - defines the contract for data access.
 */

import type { AppUser } from "../entities/AppUser";
import type { UserDto, UserUpdateDto } from "@/core/application/dtos/UserDto";

export interface GetUsersParams {
  page?: number;
  limit?: number;
}

export interface IUserRepository {
  getAll(params?: GetUsersParams): Promise<AppUser[]>;
  getById(id: string): Promise<AppUser | null>;
  create(data: Omit<UserDto, "id">): Promise<AppUser>;
  update(id: string, data: UserUpdateDto): Promise<AppUser>;
  delete(id: string): Promise<void>;
}
