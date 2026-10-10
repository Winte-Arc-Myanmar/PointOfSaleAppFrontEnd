/**
 * Role entity.
 * Domain layer - no framework dependencies.
 */

export interface Role {
  id: string;
  tenantId: string;
  parentId: string | null;
  name: string;
  isSystemDefault: boolean;
  /** The permissions the role holds, when the API sends them (a single role does). */
  permissionIds?: string[];
}

