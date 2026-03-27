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
}

