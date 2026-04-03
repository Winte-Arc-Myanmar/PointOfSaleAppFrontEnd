/**
 * Turn API-relative media paths (e.g. /uploads/...) into an absolute URL using
 * NEXT_PUBLIC_API_URL origin so next/image can load them.
 */
export function resolveMediaUrl(pathOrUrl: string | null | undefined): string {
  if (pathOrUrl == null) return "";
  const s = String(pathOrUrl).trim();
  if (!s) return "";
  if (/^https?:\/\//i.test(s)) return s;
  const api = process.env.NEXT_PUBLIC_API_URL ?? "";
  try {
    const origin = new URL(api).origin;
    return `${origin}${s.startsWith("/") ? s : `/${s}`}`;
  } catch {
    return s.startsWith("/") ? s : `/${s}`;
  }
}
