/** Sign-in page that sends the user back to `path` afterwards. */
export function loginUrlFor(path: string, reason?: "expired"): string {
  const params = new URLSearchParams();
  if (reason) params.set("reason", reason);
  if (path && path !== "/" && !path.startsWith("/login")) params.set("callbackUrl", path);
  const query = params.toString();
  return query ? `/login?${query}` : "/login";
}

/** Only a path inside this app; anything else lands on the dashboard. */
export function safeReturnPath(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/login")) {
    return "/dashboard";
  }
  return value;
}
