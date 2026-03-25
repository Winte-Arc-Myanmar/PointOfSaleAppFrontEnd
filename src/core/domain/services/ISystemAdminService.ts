/**
 * System Admin service interface.
 * Domain layer - system-admin-only operations.
 */

import type {
  OnboardTenantDto,
  SystemAdminCreateUserDto,
  AssignPermissionsDto,
  AssignRoleDto,
} from "@/core/application/dtos/SystemAdminDto";

export interface ISystemAdminService {
  onboardTenant(data: OnboardTenantDto): Promise<void>;
  deleteTenant(id: string): Promise<void>;
  createUser(data: SystemAdminCreateUserDto): Promise<void>;
  assignPermissions(data: AssignPermissionsDto): Promise<void>;
  assignRole(data: AssignRoleDto): Promise<void>;
}
