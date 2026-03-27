/**
 * Permission entity.
 * Domain layer - no framework dependencies.
 */

export interface Permission {
  id: string;
  module: string;
  subject: string;
  action: string;
  description: string;
}

