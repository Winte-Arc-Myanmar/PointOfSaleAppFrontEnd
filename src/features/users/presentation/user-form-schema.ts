import { z } from "zod";

export const USER_PREFERRED_LANGUAGES = ["EN", "MY"] as const;

const requiredText = (label: string) =>
  z.string().trim().min(1, `${label} is required`);

const emailField = requiredText("Email").email("Invalid email");

const usernameField = requiredText("Username").regex(
  /^[a-zA-Z0-9._-]{3,32}$/,
  "Use 3–32 letters, numbers, dots, underscores, or hyphens",
);

const phoneNumberField = requiredText("Phone number").regex(
  /^\+?[0-9]{7,15}$/,
  "Enter a valid phone number, e.g. +1234567890",
);

const avatarUrlField = z.string().trim();

const preferredLanguageField = z.enum(USER_PREFERRED_LANGUAGES, {
  message: "Preferred language is required",
});

const passwordField = z
  .string()
  .min(8, "Password must be at least 8 characters");

/**
 * POST /api/v1/users — all write fields required except avatar URL.
 */
export const createUserSchema = z.object({
  email: emailField,
  password: passwordField,
  username: usernameField,
  fullName: requiredText("Full name"),
  phoneNumber: phoneNumberField,
  avatarUrl: avatarUrlField,
  jobTitle: requiredText("Job title"),
  roleId: requiredText("Role"),
  branchId: requiredText("Branch"),
  preferredLanguage: preferredLanguageField,
});

/**
 * PATCH /api/v1/users/{id} — same profile fields required; password optional.
 */
export const updateUserSchema = z.object({
  email: emailField,
  password: z
    .string()
    .refine((value) => value === "" || value.length >= 8, {
      message: "Password must be at least 8 characters",
    }),
  username: usernameField,
  fullName: requiredText("Full name"),
  phoneNumber: phoneNumberField,
  avatarUrl: avatarUrlField,
  jobTitle: requiredText("Job title"),
  preferredLanguage: preferredLanguageField,
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;

export const createUserDefaultValues: CreateUserFormData = {
  email: "",
  password: "",
  username: "",
  fullName: "",
  phoneNumber: "",
  avatarUrl: "",
  jobTitle: "",
  roleId: "",
  branchId: "",
  preferredLanguage: "EN",
};

export function optionalUrl(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed || undefined;
}
