/**
 * User service interface.
 * Domain layer - defines the contract for user operations.
 */

import type { AppUser } from "../entities/AppUser";
import type { UserDto, UserUpdateDto } from "@/core/application/dtos/UserDto";
import type { GetUsersParams } from "../repositories/IUserRepository";
import type { PaginatedResult } from "../types/pagination";

export interface IUserService {
  getAll(params?: GetUsersParams): Promise<PaginatedResult<AppUser>>;
  getById(id: string): Promise<AppUser | null>;
  create(data: Omit<UserDto, "id">): Promise<AppUser>;
  update(id: string, data: UserUpdateDto): Promise<AppUser>;
  delete(id: string): Promise<void>;
}
