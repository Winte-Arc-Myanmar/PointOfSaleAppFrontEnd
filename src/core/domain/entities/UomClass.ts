/**
 * UOM Class entity 
 * Domain layer - no framework dependencies.
 */

import type { Id } from "@/core/domain/types";

export interface UomClass {
  id: Id;
  name: string;
  tenantId: string;
}
