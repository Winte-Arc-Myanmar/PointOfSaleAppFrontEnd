"use client";

import { useMutation } from "@tanstack/react-query";
import container from "@/core/infrastructure/di/container";
import type { HttpClient } from "@/core/infrastructure/api/HttpClient";
import { API_ENDPOINTS } from "@/core/infrastructure/api/constants";

const http = () => container.resolve<HttpClient>("httpClient");

/** The signed-in person changes their own password. */
export function useChangeOwnPassword() {
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      http().post<{ changed: true }>(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data),
  });
}

/** Someone who manages staff sets a new password for a user who forgot theirs. */
export function useResetUserPassword() {
  return useMutation({
    mutationFn: ({ id, newPassword }: { id: string; newPassword: string }) =>
      http().post<{ changed: true }>(API_ENDPOINTS.USERS.RESET_PASSWORD(id), {
        newPassword,
      }),
  });
}
