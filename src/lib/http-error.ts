type ApiErrorBody = {
  message?: string;
  error?: string | { message?: string; code?: string };
  errors?: Array<string | { message?: string }>;
};

function messageFromApiBody(data: ApiErrorBody | undefined): string | undefined {
  if (!data) return undefined;
  if (typeof data.message === "string" && data.message.trim()) return data.message;

  const err = data.error;
  if (typeof err === "string" && err.trim()) return err;
  if (err && typeof err === "object" && typeof err.message === "string" && err.message.trim()) {
    return err.message;
  }

  return undefined;
}

export function getHttpErrorMessage(
  error: unknown,
  fallback = "Request failed.",
): string {
  if (error == null) return fallback;
  const axiosLike = error as {
    response?: { status?: number; data?: ApiErrorBody };
    message?: string;
  };

  const fromBody = messageFromApiBody(axiosLike.response?.data);
  if (fromBody) return fromBody;

  if (error instanceof Error && error.message && !("response" in error)) {
    return error.message;
  }

  const data = axiosLike.response?.data;

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
