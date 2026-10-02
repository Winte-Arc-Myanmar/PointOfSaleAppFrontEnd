/**
 * System Admin repository interface.
 * Domain layer - system-admin-only operations.
 */

import type {
  OnboardTenantDto,
  SystemAdminCreateUserDto,
  CreatedUserDto,
  OnboardTenantResultDto,
  AssignPermissionsDto,
  AssignRoleDto,
} from "@/core/application/dtos/SystemAdminDto";

export interface ISystemAdminRepository {
  onboardTenant(data: OnboardTenantDto): Promise<OnboardTenantResultDto>;
  deleteTenant(id: string): Promise<void>;
  createUser(data: SystemAdminCreateUserDto): Promise<CreatedUserDto>;
  assignPermissions(data: AssignPermissionsDto): Promise<void>;
  assignRole(data: AssignRoleDto): Promise<void>;
  getTenantModules(tenantId: string): Promise<string[]>;
}
