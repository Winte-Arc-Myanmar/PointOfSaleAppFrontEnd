"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  useCreateProductVariant,
  useUpdateProductVariant,
} from "@/presentation/hooks/useProductVariants";
import { useToast } from "@/presentation/providers/ToastProvider";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { getHttpErrorMessage } from "@/lib/http-error";
import { formatMoney } from "@/lib/money";
import type { ProductVariant } from "@/core/domain/entities/ProductVariant";
import { variantName } from "./variant-name";

/** The product the variant belongs to: its price and SKU. */
export interface VariantProduct {
  id: string;
  name: string;
  basePrice: number;
  baseSku: string;
}

type Option = { key: string; value: string };

const skuPart = (text: string) =>
  text
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/** A SKU for a new variant: the product's, then its name ("BEER-LARGE"). */
export function suggestedSku(baseSku: string, options: Option[]): string {
  const name = options.map((o) => skuPart(o.value)).filter(Boolean).join("-");
  return [skuPart(baseSku) || "ITEM", name].filter(Boolean).join("-");
}

const label = (key: string, many: boolean) =>
  many ? key.charAt(0).toUpperCase() + key.slice(1) : "Name";

/**
 * Adds or edits one variant: its name ("Large"), what it costs on top of the
 * product, and - under More - its SKU and barcode. A variant saved with several
 * options (Size, Colour) keeps each of them as its own field.
 */
export function VariantForm({
  product,
  variant,
  formId,
  onSuccess,
  onLoadingChange,
}: {
  product: VariantProduct;
  variant?: ProductVariant;
  formId: string;
  onSuccess: () => void;
  onLoadingChange?: (loading: boolean) => void;
}) {
  const toast = useToast();
  const create = useCreateProductVariant(product.id);
  const update = useUpdateProductVariant(product.id);
  const saving = create.isPending || update.isPending;

  const [options, setOptions] = useState<Option[]>(() => {
    const entries = Object.entries(variant?.matrixOptions ?? {});
    return entries.length
      ? entries.map(([key, value]) => ({ key, value: String(value ?? "") }))
      : [{ key: "name", value: "" }];
  });
  const [extra, setExtra] = useState(
    variant ? String(variant.priceModifier ?? 0) : "0",
  );
  const [sku, setSku] = useState(variant?.variantSku ?? "");
  const [skuTouched, setSkuTouched] = useState(Boolean(variant));
  const [barcode, setBarcode] = useState(variant?.barcode ?? "");
  const [moreOpen, setMoreOpen] = useState(false);
  const [touched, setTouched] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    onLoadingChange?.(saving);
  }, [saving, onLoadingChange]);

  const effectiveSku = skuTouched ? sku : suggestedSku(product.baseSku, options);
  const extraNumber = Number(extra);
  const extraValid = extra.trim() !== "" && Number.isFinite(extraNumber);
  const sellsAt = Number(product.basePrice || 0) + (extraValid ? extraNumber : 0);
  const many = options.length > 1;

  const problem = options.some((o) => !o.value.trim())
    ? many
      ? "Fill in every option."
      : "Give the variant a name, such as Large."
    : !extraValid
      ? "The extra price must be a number (0 if it costs the same)."
      : sellsAt < 0
        ? "The extra price can't take the price below 0."
        : !effectiveSku.trim()
          ? "The SKU can't be empty."
          : null;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setTouched(true);
    setServerError(null);
    if (problem) return;
    const data = {
      variantSku: effectiveSku.trim(),
      matrixOptions: Object.fromEntries(
        options.map((o) => [o.key, o.value.trim()]),
      ),
      barcode: barcode.trim() || undefined,
      priceModifier: extraNumber,
    };
    const done = {
      onSuccess: () => {
        toast.success(
          variant
            ? `${variantName(data)} saved.`
            : `${variantName(data)} added to ${product.name}.`,
        );
        onSuccess();
      },
      onError: (error: unknown) =>
        setServerError(getHttpErrorMessage(error, "Couldn't save the variant.")),
    };
    if (variant) {
      update.mutate({ id: String(variant.id), data }, done);
    } else {
      create.mutate(data, done);
    }
  };

  return (
    <form id={formId} onSubmit={submit} className="space-y-4">
      <p className="text-sm text-muted">
        {product.name} · price {formatMoney(product.basePrice)}
      </p>

      {options.map((option, index) => (
        <div key={option.key} className="grid gap-2">
          <Label htmlFor={`variant-option-${index}`}>{label(option.key, many)}</Label>
          <Input
            id={`variant-option-${index}`}
            value={option.value}
            placeholder={many ? undefined : "e.g. Large"}
            autoFocus={index === 0}
            onChange={(event) =>
              setOptions((current) =>
                current.map((o, i) =>
                  i === index ? { ...o, value: event.target.value } : o,
                ),
              )
            }
          />
        </div>
      ))}

      <div className="grid gap-2">
        <Label htmlFor="variant-extra">Extra price</Label>
        <div className="flex flex-wrap items-center gap-3">
          <Input
            id="variant-extra"
            inputMode="decimal"
            value={extra}
            onChange={(event) => setExtra(event.target.value)}
            className="w-36"
          />
          <span className="text-sm text-muted">
            → sells at{" "}
            <span className="font-semibold text-foreground">{formatMoney(sellsAt)}</span>
          </span>
        </div>
        <p className="text-xs text-muted">
          What this variant costs on top of the product price. 0 if the same; a
          minus number makes it cheaper.
        </p>
      </div>

      <div>
        <button
          type="button"
          onClick={() => setMoreOpen((open) => !open)}
          className="inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-foreground"
          aria-expanded={moreOpen}
        >
          {moreOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          More (optional)
        </button>
        {moreOpen ? (
          <div className="mt-3 space-y-4 border-l border-border pl-4">
            <div className="grid gap-2">
              <Label htmlFor="variant-sku">SKU</Label>
              <Input
                id="variant-sku"
                value={effectiveSku}
                onChange={(event) => {
                  setSkuTouched(true);
                  setSku(event.target.value);
                }}
              />
              {!skuTouched ? (
                <p className="text-xs text-muted">Filled in from the name; change it if you like.</p>
              ) : null}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="variant-barcode">Barcode</Label>
              <Input
                id="variant-barcode"
                value={barcode}
                onChange={(event) => setBarcode(event.target.value)}
              />
            </div>
          </div>
        ) : null}
      </div>

      {touched && problem ? <p className="text-sm text-red-500">{problem}</p> : null}
      {serverError ? <p className="text-sm text-red-500">{serverError}</p> : null}
    </form>
  );
}
