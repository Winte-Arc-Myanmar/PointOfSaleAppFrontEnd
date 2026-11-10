/** A variant as people say it: its options' values, "Large" or "Large / Black". */
export function variantName(variant: {
  matrixOptions?: Record<string, unknown> | null;
  variantSku?: string;
}): string {
  const name = Object.values(variant.matrixOptions ?? {})
    .map((value) => String(value ?? "").trim())
    .filter(Boolean)
    .join(" / ");
  return name || variant.variantSku || "Default";
}
