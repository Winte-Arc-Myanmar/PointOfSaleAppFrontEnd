/**
 * User entity <-> DTO mappers.
 * Application layer.
 */

import type { AppUser } from "@/core/domain/entities/AppUser";
import type { UserDto } from "../dtos/UserDto";

export function toAppUser(dto: UserDto & { id: string }): AppUser {
  const response = dto as UserDto & {
    branch_id?: string | null;
    assignedBranchId?: string | null;
    branch?: string | { id?: string | null } | null;
  };
  const nestedBranchId =
    typeof response.branch === "string" ? response.branch : response.branch?.id;

  return {
    id: dto.id,
    email: dto.email,
    username: dto.username,
    fullName: dto.fullName,
    phoneNumber: dto.phoneNumber,
    avatarUrl: dto.avatarUrl,
    jobTitle: dto.jobTitle,
    roleId: dto.roleId,
    branchId:
      dto.branchId ?? response.branch_id ?? response.assignedBranchId ?? nestedBranchId ?? undefined,
    preferredLanguage: dto.preferredLanguage,
    status: dto.status,
    lastLoginAt: dto.lastLoginAt ?? undefined,
    loginAttempts: dto.loginAttempts,
    lockoutUntil: dto.lockoutUntil ?? undefined,
    metadata: dto.metadata ?? undefined,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
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
