import { z } from "zod";
import { createTenantSchema } from "@/features/tenants/presentation/tenant-form-schema";
import { createUserSchema } from "@/features/users/presentation/user-form-schema";

const requiredText = (label: string) =>
  z.string().trim().min(1, `${label} is required`);

const requiredId = (label: string) => requiredText(label);

const phoneField = requiredText("Phone").regex(
  /^\+?[0-9]{7,15}$/,
  "Enter a valid phone number, e.g. +1234567890",
);

const onboardTenantFields = createTenantSchema.pick({
  name: true,
  legalName: true,
  domain: true,
  website: true,
  address: true,
  city: true,
  state: true,
  country: true,
  zipCode: true,
});

const onboardOwnerFields = createUserSchema.pick({
  email: true,
  password: true,
  username: true,
  fullName: true,
  phoneNumber: true,
  jobTitle: true,
});

/**
 * POST /api/v1/system-admin/tenants/onboard
 */
export const onboardTenantSchema = z.object({
  tenant: onboardTenantFields,
  branch: z.object({
    name: requiredText("Branch name"),
    branchCode: requiredText("Branch code"),
    address: requiredText("Address"),
    city: requiredText("City"),
    phone: phoneField,
  }),
  owner: onboardOwnerFields,
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
    username: "",
    fullName: "",
    phoneNumber: "",
    jobTitle: "",
  },
};

export const assignPermissionsDefaultValues: AssignPermissionsFormData = {
  roleId: "",
  permissionIds: [],
};

export const assignRoleDefaultValues: AssignRoleFormData = {
  userId: "",
  roleId: "",
  tenantId: "",
  branchId: "",
};
