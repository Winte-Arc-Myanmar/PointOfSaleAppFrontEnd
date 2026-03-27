/**
 * DTOs for roles API.
 * Application layer 
 */

export interface RoleDto {
  id: string;
  tenantId: string;
  parentId: string | null;
  name: string;
  isSystemDefault: boolean;
}

export interface CreateRoleDto {
  name: string;
  tenantId: string;
  parentId?: string;
  isSystemDefault?: boolean;
}

export interface AssignRolePermissionsDto {
  roleId: string;
  permissionIds: string[];
}

