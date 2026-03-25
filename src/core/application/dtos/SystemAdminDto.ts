/**
 * DTOs for system-admin API operations.
 */

export interface OnboardTenantDto {
  tenant: {
    name: string;
    legalName?: string;
    domain?: string;
    website?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  branch: {
    name: string;
    branchCode: string;
    address?: string;
    city?: string;
    phone?: string;
  };
  owner: {
    email: string;
    password: string;
    username: string;
    fullName: string;
    phoneNumber?: string;
    jobTitle?: string;
  };
}

export interface SystemAdminCreateUserDto {
  email: string;
  password: string;
  username: string;
  fullName: string;
  phoneNumber?: string;
  avatarUrl?: string;
  jobTitle?: string;
  roleId: string;
  branchId: string;
  preferredLanguage?: string;
  tenantId: string;
}

export interface AssignPermissionsDto {
  roleId: string;
  permissionIds: string[];
}

export interface AssignRoleDto {
  userId: string;
  roleId: string;
  tenantId: string;
  branchId: string;
}
