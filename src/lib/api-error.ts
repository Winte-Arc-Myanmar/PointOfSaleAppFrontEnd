import { isAxiosError } from "axios";

/** The backend's own message for a failed request, else the fallback. */
export function apiErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const body = error.response?.data as
      | { error?: { message?: unknown }; message?: unknown }
      | undefined;
    const message = body?.error?.message ?? body?.message;
    if (typeof message === "string" && message.trim()) return message;
    if (Array.isArray(message) && message.length) return message.join(", ");
  }
  return fallback;
}
