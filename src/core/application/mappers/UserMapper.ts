/**
 * User entity <-> DTO mappers.
 * Application layer.
 */

import type { AppUser } from "@/core/domain/entities/AppUser";
import type { UserDto } from "../dtos/UserDto";

export function toAppUser(dto: UserDto & { id: string }): AppUser {
  return {
    id: dto.id,
    email: dto.email,
    username: dto.username,
    fullName: dto.fullName,
    phoneNumber: dto.phoneNumber,
    avatarUrl: dto.avatarUrl,
    jobTitle: dto.jobTitle,
    roleId: dto.roleId,
    branchId: dto.branchId,
    preferredLanguage: dto.preferredLanguage,
  };
}

export function toUserDto(user: Partial<AppUser>): UserDto {
  return {
    ...(user.id && { id: user.id }),
    email: user.email ?? "",
    username: user.username ?? "",
    fullName: user.fullName ?? "",
    phoneNumber: user.phoneNumber,
    avatarUrl: user.avatarUrl,
    jobTitle: user.jobTitle,
    roleId: user.roleId,
    branchId: user.branchId,
    preferredLanguage: user.preferredLanguage,
  };
}
