/**
 * User service implementation.
 * Application layer - delegates to IUserRepository.
 */

import type { IUserService } from "@/core/domain/services/IUserService";
import type { IUserRepository } from "@/core/domain/repositories/IUserRepository";
import type { GetUsersParams } from "@/core/domain/repositories/IUserRepository";
import type { AppUser } from "@/core/domain/entities/AppUser";
import type { UserDto, UserUpdateDto } from "../dtos/UserDto";

export class UserService implements IUserService {
  constructor(private readonly userRepository: IUserRepository) {}

  async getAll(params?: GetUsersParams): Promise<AppUser[]> {
    return this.userRepository.getAll(params);
  }

  async getById(id: string): Promise<AppUser | null> {
    return this.userRepository.getById(id);
  }

  async create(data: Omit<UserDto, "id">): Promise<AppUser> {
    return this.userRepository.create(data);
  }

  async update(id: string, data: UserUpdateDto): Promise<AppUser> {
    return this.userRepository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    return this.userRepository.delete(id);
  }
}
