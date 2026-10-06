/**
 * DTOs for POS register API request/response.
 */

export interface PosRegisterDto {
  id?: string;
  tenantId: string;
  locationId: string;
  name: string;
  macAddress: string;
  sellsAt?: ("BAR" | "KTV" | "SPA")[];
  shiftRule?: "PER_LOGIN" | "DAILY";
  checkoutPrinterIds?: string[];
  financePrinterIds?: string[];
  createdAt?: string | null;
  updatedAt?: string | null;
}

