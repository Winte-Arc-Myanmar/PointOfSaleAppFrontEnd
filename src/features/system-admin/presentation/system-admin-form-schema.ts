import { z } from "zod";
import { createUserSchema } from "@/features/users/presentation/user-form-schema";

const requiredText = (label: string) =>
  z.string().trim().min(1, `${label} is required`);

const requiredId = (label: string) => requiredText(label);

/** Blank, or a real value: the optional onboarding fields can be filled in later. */
const optional = z.string().trim();
const optionalPhone = optional.refine(
  (value) => value === "" || /^\+?[0-9]{7,15}$/.test(value),
  "Enter a valid phone number, e.g. +959123456789",
);
const optionalEmail = optional.refine(
  (value) => value === "" || z.string().email().safeParse(value).success,
  "Enter a valid email",
);
const optionalUrl = optional.refine(
  (value) => value === "" || z.string().url().safeParse(value).success,
  "Enter a full address, e.g. https://example.com",
);

/** Where most tenants are; the business day rolls over at its midnight. */
export const DEFAULT_TENANT_TIMEZONE = "Asia/Yangon";

/**
 * POST /api/v1/system-admin/tenants/onboard
 *
 * Only the shop name, branch name and the owner's name and password are needed
 * to open a shop; everything else is optional and can be set in Shop settings.
 */
export const onboardTenantSchema = z.object({
  tenant: z.object({
    name: requiredText("Shop name"),
    timezone: requiredText("Timezone"),
    legalName: optional,
    domain: optional,
    website: optionalUrl,
    address: optional,
    city: optional,
    state: optional,
    country: optional,
    zipCode: optional,
  }),
  branch: z.object({
    name: requiredText("Branch name"),
    branchCode: optional,
    address: optional,
    city: optional,
    phone: optionalPhone,
  }),
  owner: z.object({
    fullName: requiredText("Owner name"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    email: optionalEmail,
    phoneNumber: optionalPhone,
    jobTitle: optional,
  }),
});

/**
 * POST /api/v1/system-admin/users
 */
export const systemAdminCreateUserSchema = createUserSchema.extend({
  tenantId: requiredId("Tenant"),
});

/**
 * POST /api/v1/system-admin/roles/assign-permissions
 */
export const assignPermissionsSchema = z.object({
  tenantId: requiredId("Tenant"),
  roleId: requiredId("Role"),
  permissionIds: z
    .array(z.string().trim().min(1))
    .min(1, "At least one permission is required"),
});

/**
 * POST /api/v1/system-admin/users/assign-role
 */
export const assignRoleSchema = z.object({
  userId: requiredId("User"),
  roleId: requiredId("Role"),
  tenantId: requiredId("Tenant"),
  branchId: requiredId("Branch"),
});

export type OnboardTenantFormData = z.infer<typeof onboardTenantSchema>;
export type SystemAdminCreateUserFormData = z.infer<
  typeof systemAdminCreateUserSchema
>;
export type AssignPermissionsFormData = z.infer<typeof assignPermissionsSchema>;
export type AssignRoleFormData = z.infer<typeof assignRoleSchema>;

export const onboardTenantDefaultValues: OnboardTenantFormData = {
  tenant: {
    name: "",
    timezone: DEFAULT_TENANT_TIMEZONE,
    legalName: "",
    domain: "",
    website: "",
    address: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
  },
  branch: {
    name: "",
    branchCode: "",
    address: "",
    city: "",
    phone: "",
  },
  owner: {
    email: "",
    password: "",
    fullName: "",
    phoneNumber: "",
    jobTitle: "",
  },
};

export const assignPermissionsDefaultValues: AssignPermissionsFormData = {
  tenantId: "",
  roleId: "",
  permissionIds: [],
};

export const assignRoleDefaultValues: AssignRoleFormData = {
  userId: "",
  roleId: "",
  tenantId: "",
  branchId: "",
};
