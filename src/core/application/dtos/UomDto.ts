/**
 * DTOs for UOM API request/response.
 * Application layer - matches backend contract.
 */

export interface UomDto {
  id?: string;
  name: string;
  classId: string;
  abbreviation: string;
  conversionRateToBase: number;
}
