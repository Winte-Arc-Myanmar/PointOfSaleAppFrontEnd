/**
 * System Admin service implementation.
 * Application layer - delegates to ISystemAdminRepository.
 */

import type { ISystemAdminService } from "@/core/domain/services/ISystemAdminService";
import type { ISystemAdminRepository } from "@/core/domain/repositories/ISystemAdminRepository";
import type {
  OnboardTenantDto,
  SystemAdminCreateUserDto,
  AssignPermissionsDto,
  AssignRoleDto,
} from "@/core/application/dtos/SystemAdminDto";

export class SystemAdminService implements ISystemAdminService {
  constructor(private readonly repo: ISystemAdminRepository) {}

  onboardTenant(data: OnboardTenantDto) {
    return this.repo.onboardTenant(data);
  }

  deleteTenant(id: string) {
    return this.repo.deleteTenant(id);
  }

  createUser(data: SystemAdminCreateUserDto) {
    return this.repo.createUser(data);
  }

  assignPermissions(data: AssignPermissionsDto) {
    return this.repo.assignPermissions(data);
  }

  assignRole(data: AssignRoleDto) {
    return this.repo.assignRole(data);
  }
}
