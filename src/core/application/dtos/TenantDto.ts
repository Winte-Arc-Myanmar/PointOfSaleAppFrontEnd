/**
 * DTOs for tenant API request/response.
 * Application layer - matches backend contract.
 */

export interface TenantDto {
  id?: string;
  name: string;
  legalName: string;
  domain: string;
  website: string;
  logoUrl: string;
  primaryContactName: string;
  primaryContactEmail: string;
  primaryContactPhone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}
