type ApiErrorBody = {
  message?: string;
  error?: string;
  errors?: Array<string | { message?: string }>;
};

export function getHttpErrorMessage(
  error: unknown,
  fallback = "Request failed.",
): string {
  if (error instanceof Error && error.message && !("response" in error)) {
    return error.message;
  }

  const axiosLike = error as {
    response?: { status?: number; data?: ApiErrorBody };
    message?: string;
  };

  const data = axiosLike.response?.data;
  if (data?.message) return data.message;
  if (data?.error) return data.error;

  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    const first = data.errors[0];
    if (typeof first === "string") return first;
    if (first?.message) return first.message;
  }

  const status = axiosLike.response?.status;
  if (status === 401) return "Session expired. Please sign in again.";
  if (status === 403) return "You do not have permission for this action.";
  if (status === 409) return "A record with that name already exists.";

  if (axiosLike.message) return axiosLike.message;
  return fallback;
}
