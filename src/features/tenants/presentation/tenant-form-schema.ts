import { z } from "zod";
import type { TenantCurrency } from "@/core/domain/entities/Tenant";

const requiredText = (label: string) =>
  z.string().trim().min(1, `${label} is required`);

const optionalUrl = z.string().trim().url("Invalid URL").or(z.literal(""));

const phoneNumberField = requiredText("Phone number").regex(
  /^\+?[0-9]{7,15}$/,
  "Enter a valid phone number, e.g. +1234567890",
);

const tenantWriteFields = {
  name: requiredText("Name"),
  legalName: requiredText("Legal name"),
  domain: requiredText("Domain").regex(
    /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/,
    "Enter a valid domain, e.g. kfc.com",
  ),
  website: requiredText("Website").url("Invalid URL"),
  logoUrl: optionalUrl,
  primaryContactName: requiredText("Primary contact name"),
  primaryContactEmail: requiredText("Primary contact email").email(
    "Invalid email",
  ),
  primaryContactPhone: phoneNumberField,
  address: requiredText("Address"),
  city: requiredText("City"),
  state: requiredText("State"),
  country: requiredText("Country"),
  zipCode: requiredText("Zip code"),
};

/**
 * Shared write fields for tenant create/update.
 * PATCH /api/v1/tenants/{id} uses these body fields.
 */
export const createTenantSchema = z.object(tenantWriteFields);

export const updateTenantSchema = createTenantSchema.extend({
  baseCurrency: z.enum(["MMK", "USD"], {
    message: "Base currency is required",
  }),
});

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

export const TENANT_CURRENCIES: TenantCurrency[] = ["MMK", "USD"];
