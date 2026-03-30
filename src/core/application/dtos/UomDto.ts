/**
 * DTOs for UOM API request/response.
 * Application layer - matches backend contract.
 */

export interface UomDto {
  id?: string;
  name: string;
  classId: string;
  abbreviation: string;
  /** API reads/writes this as a decimal string (e.g. "1.000000"); normalized on HTTP write. */
  conversionRateToBase: number | string;
}
