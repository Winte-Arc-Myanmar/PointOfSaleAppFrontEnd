import type { AppUser } from "@/core/domain/entities/AppUser";

export const isSuspended = (user: Pick<AppUser, "status">) =>
  Boolean(user.status) && user.status !== "ACTIVE";

export const userStatusLabel = (status?: string) =>
  !status ? "—" : status === "ACTIVE" ? "Active" : status === "INACTIVE" ? "Suspended" : status;
