import { z } from "zod";

export const customerFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  tenantId: z.string().min(1, "Tenant is required"),
  phone: z.string(),
  email: z.union([z.literal(""), z.string().trim().email("Enter a valid email")]),
  accountType: z.string().min(1, "Account type is required"),
  hasCreditAccount: z.boolean(),
  maxCreditLimit: z.string(),
  paymentTermsDays: z.number().min(0),
  loyaltyTier: z.string().min(1, "Loyalty tier is required"),
});

export type CustomerFormData = z.infer<typeof customerFormSchema>;

export function toCustomerMutationBody(data: CustomerFormData) {
  return {
    name: data.name,
    tenantId: data.tenantId,
    phone: data.phone,
    email: data.email,
    accountType: data.accountType,
    hasCreditAccount: data.hasCreditAccount,
    maxCreditLimit: data.maxCreditLimit || "0.0000",
    paymentTermsDays: data.paymentTermsDays ?? 0,
    loyaltyTier: data.loyaltyTier,
  };
}
