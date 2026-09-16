/** Normalize RFID/NFC UIDs from readers (colons, spaces, lowercase) to POS format. */
export function normalizeCardUid(raw: string): string {
  return raw.replace(/[^0-9a-zA-Z]/g, "").toUpperCase();
}

export function isLikelyCardUid(value: string): boolean {
  const uid = normalizeCardUid(value);
  return uid.length >= 4 && uid.length <= 32;
}
