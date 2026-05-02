/**
 * System Admin repository - calls system-admin API endpoints.
 * Infrastructure layer.
 */

import type { ISystemAdminRepository } from "@/core/domain/repositories/ISystemAdminRepository";
import type {
  OnboardTenantDto,
  SystemAdminCreateUserDto,
  AssignPermissionsDto,
  AssignRoleDto,
} from "@/core/application/dtos/SystemAdminDto";
import type { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";

export class ApiSystemAdminRepository implements ISystemAdminRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async onboardTenant(data: OnboardTenantDto): Promise<void> {
    await this.httpClient.post(API_ENDPOINTS.SYSTEM_ADMIN.ONBOARD_TENANT, data);
  }

  async deleteTenant(id: string): Promise<void> {
    await this.httpClient.delete(API_ENDPOINTS.SYSTEM_ADMIN.DELETE_TENANT(id));
  }

  async createUser(data: SystemAdminCreateUserDto): Promise<void> {
    await this.httpClient.post(API_ENDPOINTS.SYSTEM_ADMIN.CREATE_USER, data);
  }

  async assignPermissions(data: AssignPermissionsDto): Promise<void> {
    await this.httpClient.post(API_ENDPOINTS.SYSTEM_ADMIN.ASSIGN_PERMISSIONS, data);
  }

  async assignRole(data: AssignRoleDto): Promise<void> {
    await this.httpClient.post(API_ENDPOINTS.SYSTEM_ADMIN.ASSIGN_ROLE, data);
  }
}

