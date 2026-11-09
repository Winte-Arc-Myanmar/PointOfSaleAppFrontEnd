import { z } from "zod";
import type { TenantCurrency } from "@/core/domain/entities/Tenant";

const requiredText = (label: string) =>
  z.string().trim().min(1, `${label} is required`);

const optionalText = z.string().trim();

const optionalMatching = (check: (value: string) => boolean, message: string) =>
  optionalText.refine((value) => !value || check(value), message);

const optionalUrl = optionalMatching(
  (value) => z.string().url().safeParse(value).success,
  "Invalid URL",
);

const tenantWriteFields = {
  name: requiredText("Name"),
  legalName: optionalText,
  domain: optionalMatching(
    (value) =>
      /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/.test(value),
    "Enter a valid domain, e.g. kfc.com",
  ),
  website: optionalUrl,
  logoUrl: optionalText,
  primaryContactName: optionalText,
  primaryContactEmail: optionalMatching(
    (value) => z.string().email().safeParse(value).success,
    "Invalid email",
  ),
  primaryContactPhone: optionalMatching(
    (value) => /^\+?[0-9]{7,15}$/.test(value),
    "Enter a valid phone number, e.g. +1234567890",
  ),
  address: optionalText,
  city: optionalText,
  state: optionalText,
  country: optionalText,
  zipCode: optionalText,
};

/**
 * Shared write fields for tenant create/update.
 * PATCH /api/v1/tenants/{id} uses these body fields.
 */
export const createTenantSchema = z.object(tenantWriteFields);

export const updateTenantSchema = createTenantSchema;

export type CreateTenantFormData = z.infer<typeof createTenantSchema>;
export type UpdateTenantFormData = z.infer<typeof updateTenantSchema>;

export const createTenantDefaultValues: CreateTenantFormData = {
  name: "",
  legalName: "",
  domain: "",
  website: "",
  logoUrl: "",
  primaryContactName: "",
  primaryContactEmail: "",
  primaryContactPhone: "",
  address: "",
  city: "",
  state: "",
  country: "",
  zipCode: "",
};

export function emptyToBlank(value: string): string {
  return value.trim();
}

/** A blank domain is left out: the domain is unique, so two shops cannot both send "". */
export function domainPayload(value: string): { domain?: string } {
  const domain = value.trim();
  return domain ? { domain } : {};
}

export const TENANT_CURRENCIES: TenantCurrency[] = ["MMK", "USD"];
