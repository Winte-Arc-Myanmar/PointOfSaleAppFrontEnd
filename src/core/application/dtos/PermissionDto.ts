/**
 * DTOs for permissions API.
 * Application layer 
 */

export interface PermissionDto {
  id: string;
  module: string;
  subject: string;
  action: string;
  description: string;
}

