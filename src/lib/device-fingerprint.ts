function fnv1a32(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  // unsigned → hex
  return (hash >>> 0).toString(16).padStart(8, "0");
}

/**
 * Best-effort browser fingerprint.
 * Note: This is NOT a MAC address; browsers do not expose MAC reliably.
 */
export function generateBrowserDeviceId(prefix = "FP"): string {
  if (typeof window === "undefined") return `${prefix}-server`;
  const nav = window.navigator as Navigator & { deviceMemory?: number };
  const parts = [
    nav.userAgent,
    nav.platform,
    nav.language,
    (nav.languages ?? []).join(","),
    String(nav.hardwareConcurrency ?? ""),
    String(nav.deviceMemory ?? ""),
    Intl.DateTimeFormat().resolvedOptions().timeZone ?? "",
    String(window.screen?.width ?? ""),
    String(window.screen?.height ?? ""),
    String(window.screen?.colorDepth ?? ""),
  ];
  return `${prefix}-${fnv1a32(parts.join("|"))}`;
}

