/**
 * UOM entity 
 * Domain layer - no framework dependencies.
 */

import type { Id } from "@/core/domain/types";

export interface Uom {
  id: Id;
  name: string;
  classId: string;
  abbreviation: string;
  conversionRateToBase: number;
}
