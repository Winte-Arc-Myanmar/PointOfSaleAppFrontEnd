/**
 * DTOs for user API request/response.
 * Application layer - matches backend contract.
 */

export interface UserDto {
  id?: string;
  email: string;
  password?: string;
  username: string;
  fullName: string;
  phoneNumber?: string;
  avatarUrl?: string;
  jobTitle?: string;
  roleId?: string;
  branchId?: string;
  preferredLanguage?: string;
}

/** PATCH body - email, password, username, fullName, phoneNumber, avatarUrl, jobTitle, preferredLanguage */
export type UserUpdateDto = Partial<
  Pick<
    UserDto,
    | "email"
    | "password"
    | "username"
    | "fullName"
    | "phoneNumber"
    | "avatarUrl"
    | "jobTitle"
    | "preferredLanguage"
  >
>;
