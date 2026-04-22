"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import {
  ShoppingCart,
  Search,
  Plus,
  Trash2,
  Settings2,
  KeyRound,
  Delete,
  CreditCard,
  RefreshCw,
  Package,
} from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/presentation/components/ui/dialog";
import { AppLoader } from "@/presentation/components/loader";
import { cn } from "@/lib/utils";
import { resolveMediaUrl } from "@/lib/media-url";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { usePermissions } from "@/presentation/hooks/usePermissions";
import { useTenants } from "@/presentation/hooks/useTenants";
import { useLocations } from "@/presentation/hooks/useLocations";
import { usePosSessions } from "@/presentation/hooks/usePosSessions";
import { useCustomers } from "@/presentation/hooks/useCustomers";
import { usePaymentMethods } from "@/presentation/hooks/usePaymentMethods";
import { useProducts } from "@/presentation/hooks/useProducts";
import { useProductVariants } from "@/presentation/hooks/useProductVariants";
import { useCheckoutProcess } from "@/presentation/hooks/useCheckout";
import type { CheckoutRequestDto } from "@/core/application/dtos/CheckoutDto";
import type { Product } from "@/core/domain/entities/Product";
import type { ProductVariant } from "@/core/domain/entities/ProductVariant";

function money(n: number): string {
  return Number.isFinite(n) ? n.toFixed(2) : "—";
}

function money4(n: number): string {
  return Number.isFinite(n) ? n.toFixed(4) : "—";
}

function resolveProductImageSrc(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("data:") || /^https?:\/\//i.test(trimmed)) return trimmed;
  return resolveMediaUrl(trimmed);
}

function safeRate(val: unknown): number {
  const n = typeof val === "number" ? val : Number(val);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function calcTax(amount: number, rate: number, isPriceInclusive: boolean): number {
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  const r = safeRate(rate);
  if (r <= 0) return 0;
  if (isPriceInclusive) {
    // gross already includes tax: tax = gross - gross/(1+r)
    return amount - amount / (1 + r);
  }
  // net excludes tax: tax = net*r
  return amount * r;
}

function calcLineTotals(args: {
  unitPrice: number;
  quantity: number;
  lineDiscount: number;
  isTaxable: boolean;
  taxRate: number;
  isPriceInclusive: boolean;
}) {
  const qty = Number(args.quantity) || 0;
  const unit = Number(args.unitPrice) || 0;
  const discount = Number(args.lineDiscount) || 0;
  const base = unit * qty - discount;
  const netOrGross = base > 0 ? base : 0;

  const taxable = Boolean(args.isTaxable);
  const rate = safeRate(args.taxRate);
  const inclusive = Boolean(args.isPriceInclusive);

  const taxAmount = taxable && rate > 0 ? calcTax(netOrGross, rate, inclusive) : 0;
  const lineTotal = inclusive ? netOrGross : netOrGross + taxAmount;

  return { netOrGross, taxAmount, lineTotal };
}

function newIdempotencyKey(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `idem-${Date.now()}`;
  }
}

function errorMessage(err: unknown): string {
  if (err && typeof err === "object") {
    const e = err as {
      message?: unknown;
      response?: { data?: { message?: unknown; error?: unknown } };
    };
    const msg =
      e?.response?.data?.message ??
      e?.response?.data?.error ??
      e?.message ??
      undefined;
    if (typeof msg === "string" && msg.trim()) return msg;
  }
  if (typeof err === "string" && err.trim()) return err;
  return "Checkout failed.";
}

type FormValues = CheckoutRequestDto;

interface LineMeta {
  productName: string;
  productImage?: string | null;
  variantSku: string;
  unitPrice: number;
  isTaxable: boolean;
  taxRate: number;
  isPriceInclusive: boolean;
}

export function CheckoutSection() {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const { tenantId } = usePermissions();
  const checkout = useCheckoutProcess();

  const { data: tenants = [] } = useTenants();
  const { data: allLocations = [] } = useLocations({ page: 1, limit: 200 });
  const { data: allSessions = [] } = usePosSessions({
    page: 1,
    limit: 200,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const { data: allCustomers = [] } = useCustomers({ page: 1, limit: 50 });
  const { data: allPaymentMethods = [] } = usePaymentMethods({
    page: 1,
    limit: 200,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const { data: products = [], isLoading: productsLoading } = useProducts({
    page: 1,
    limit: 200,
  });

  const form = useForm<FormValues>({
    defaultValues: {
      tenantId: tenantId ?? "",
      locationId: "",
      salesChannel: "POS",
      customerId: null,
      posSessionId: "",
      idempotencyKey: newIdempotencyKey(),
      items: [],
      payments: [{ paymentMethodId: "", amount: 0, transactionReference: "" }],
    },
  });

  useEffect(() => {
    if (!form.getValues("tenantId") && tenantId)
      form.setValue("tenantId", tenantId);
  }, [tenantId]); // eslint-disable-line react-hooks/exhaustive-deps

  const items = useFieldArray({ control: form.control, name: "items" });
  const payments = useFieldArray({ control: form.control, name: "payments" });

  const selectedTenantId = useWatch({
    control: form.control,
    name: "tenantId",
  });
  const selectedLocationId = useWatch({
    control: form.control,
    name: "locationId",
  });
  const selectedSessionId = useWatch({
    control: form.control,
    name: "posSessionId",
  });
  const selectedCustomerId = useWatch({
    control: form.control,
    name: "customerId",
  });
  const watchedItemsRaw = useWatch({ control: form.control, name: "items" });
  const watchedPaymentsRaw = useWatch({
    control: form.control,
    name: "payments",
  });
  const watchedItems = useMemo(() => watchedItemsRaw ?? [], [watchedItemsRaw]);
  const watchedPayments = useMemo(
    () => watchedPaymentsRaw ?? [],
    [watchedPaymentsRaw],
  );

  const locations = useMemo(
    () =>
      selectedTenantId
        ? allLocations.filter(
            (l) => String(l.tenantId) === String(selectedTenantId),
          )
        : allLocations,
    [allLocations, selectedTenantId],
  );
  const sessions = useMemo(
    () =>
      selectedTenantId
        ? allSessions.filter(
            (s) => String(s.tenantId) === String(selectedTenantId),
          )
        : allSessions,
    [allSessions, selectedTenantId],
  );
  const customers = useMemo(
    () =>
      selectedTenantId
        ? allCustomers.filter(
            (c) => String(c.tenantId) === String(selectedTenantId),
          )
        : allCustomers,
    [allCustomers, selectedTenantId],
  );
  const paymentMethods = useMemo(
    () =>
      selectedTenantId
        ? allPaymentMethods.filter(
            (m) => String(m.tenantId) === String(selectedTenantId),
          )
        : allPaymentMethods,
    [allPaymentMethods, selectedTenantId],
  );

  useEffect(() => {
    if (
      selectedLocationId &&
      !locations.some((l) => String(l.id) === String(selectedLocationId))
    ) {
      form.setValue("locationId", "");
    }
    if (
      selectedSessionId &&
      !sessions.some((s) => String(s.id) === String(selectedSessionId))
    ) {
      form.setValue("posSessionId", "");
    }
    if (
      selectedCustomerId &&
      !customers.some((c) => String(c.id) === String(selectedCustomerId))
    ) {
      form.setValue("customerId", null);
    }
    watchedPayments.forEach((p, i) => {
      if (
        p?.paymentMethodId &&
        !paymentMethods.some((m) => String(m.id) === String(p.paymentMethodId))
      ) {
        form.setValue(`payments.${i}.paymentMethodId`, "");
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTenantId]);

  const [lineMeta, setLineMeta] = useState<Record<string, LineMeta>>({});
  const [activeLineIndex, setActiveLineIndex] = useState<number | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [productSearch, setProductSearch] = useState("");

  const [variantPickerProductId, setVariantPickerProductId] = useState<
    string | null
  >(null);

  const selectedProduct = useMemo(() => {
    if (!variantPickerProductId) return null;
    return (
      products.find((p) => String(p.id) === String(variantPickerProductId)) ??
      null
    );
  }, [variantPickerProductId, products]);

  const { data: variants = [], isLoading: variantsLoading } =
    useProductVariants(variantPickerProductId, { page: 1, limit: 200 });

  const filteredProducts = useMemo(() => {
    const s = productSearch.trim().toLowerCase();
    const base = Array.isArray(products) ? products : [];
    const byTenant = selectedTenantId
      ? base.filter((p) => String(p.tenantId) === String(selectedTenantId))
      : base;
    if (!s) return byTenant;
    return byTenant.filter((p) => {
      const hay = `${p.name} ${p.baseSku}`.toLowerCase();
      return hay.includes(s);
    });
  }, [products, productSearch, selectedTenantId]);

  const subtotal = useMemo(() => {
    return watchedItems.reduce((sum, it, i) => {
      const meta = lineMeta[String(it?.variantId ?? "") + ":" + i];
      const { lineTotal } = calcLineTotals({
        unitPrice: meta?.unitPrice ?? 0,
        quantity: Number(it?.quantity) || 0,
        lineDiscount: Number(it?.lineDiscount) || 0,
        isTaxable: Boolean(meta?.isTaxable),
        taxRate: meta?.taxRate ?? 0,
        isPriceInclusive: Boolean(meta?.isPriceInclusive),
      });
      return sum + lineTotal;
    }, 0);
  }, [watchedItems, lineMeta]);

  const taxTotal = useMemo(() => {
    return watchedItems.reduce((sum, it, i) => {
      const meta = lineMeta[String(it?.variantId ?? "") + ":" + i];
      const { taxAmount } = calcLineTotals({
        unitPrice: meta?.unitPrice ?? 0,
        quantity: Number(it?.quantity) || 0,
        lineDiscount: Number(it?.lineDiscount) || 0,
        isTaxable: Boolean(meta?.isTaxable),
        taxRate: meta?.taxRate ?? 0,
        isPriceInclusive: Boolean(meta?.isPriceInclusive),
      });
      return sum + taxAmount;
    }, 0);
  }, [watchedItems, lineMeta]);

  const netSubtotal = useMemo(() => subtotal - taxTotal, [subtotal, taxTotal]);

  const totalPaid = useMemo(() => {
    return watchedPayments.reduce(
      (sum, p) => sum + (Number(p?.amount) || 0),
      0,
    );
  }, [watchedPayments]);

  const changeDue = useMemo(() => {
    const diff = totalPaid - subtotal;
    return diff > 0 ? diff : 0;
  }, [totalPaid, subtotal]);

  function addVariantToCart(product: Product, variant: ProductVariant) {
    const variantId = String(variant.id);
    const existingIdx = watchedItems.findIndex(
      (it) => String(it?.variantId) === variantId,
    );
    if (existingIdx >= 0) {
      const currentQty = Number(watchedItems[existingIdx]?.quantity) || 0;
      form.setValue(`items.${existingIdx}.quantity`, currentQty + 1);
      setActiveLineIndex(existingIdx);
    } else {
      items.append({ variantId, quantity: 1, lineDiscount: 0 });
      const newIdx = watchedItems.length;
      const unitPrice =
        (Number(product.basePrice) || 0) + (Number(variant.priceModifier) || 0);
      const isTaxable = Boolean(product.isTaxable);
      const taxRate = product.taxRateRatePercentage ?? 0;
      const isPriceInclusive = Boolean(product.taxRateIsPriceInclusive);
      setLineMeta((prev) => ({
        ...prev,
        [variantId + ":" + newIdx]: {
          productName: product.name,
          productImage: product.imageUrl ?? null,
          variantSku: variant.variantSku,
          unitPrice,
          isTaxable,
          taxRate,
          isPriceInclusive,
        },
      }));
      setActiveLineIndex(newIdx);
    }
    setVariantPickerProductId(null);
    toast.success(`${product.name} added.`);
  }

  function onProductClick(product: Product) {
    setVariantPickerProductId(String(product.id));
  }

  function setQty(index: number, value: number) {
    form.setValue(`items.${index}.quantity`, Math.max(0, value));
  }

  function numpadPress(key: string) {
    if (activeLineIndex == null) {
      toast.error("Select a cart line first.");
      return;
    }
    const current = String(
      form.getValues(`items.${activeLineIndex}.quantity`) ?? "",
    );
    if (key === "C") {
      setQty(activeLineIndex, 0);
      return;
    }
    if (key === "<") {
      const next = current.length <= 1 ? "0" : current.slice(0, -1);
      const n = Number(next);
      setQty(activeLineIndex, Number.isFinite(n) ? n : 0);
      return;
    }
    if (key === ".") {
      if (current.includes(".")) return;
      form.setValue(
        `items.${activeLineIndex}.quantity`,
        Number(current + ".") || 0,
      );
      return;
    }
    const next = current === "0" ? key : current + key;
    const n = Number(next);
    if (Number.isFinite(n)) setQty(activeLineIndex, n);
  }

  async function clearCart() {
    if (items.fields.length === 0) return;
    const ok = await confirm({
      title: "Clear cart",
      description: "Remove all items from the cart?",
      confirmLabel: "Clear",
      variant: "destructive",
    });
    if (!ok) return;
    form.setValue("items", []);
    setLineMeta({});
    setActiveLineIndex(null);
  }

  function onSubmit(v: FormValues) {
    if (!v.tenantId?.trim()) return toast.error("Tenant is required.");
    if (!v.locationId?.trim()) return toast.error("Location is required.");
    if (!v.posSessionId?.trim()) return toast.error("POS session is required.");
    if (!v.idempotencyKey?.trim())
      return toast.error("Idempotency key is required.");
    if (!Array.isArray(v.items) || v.items.length === 0)
      return toast.error("Add at least one item.");
    if (!Array.isArray(v.payments) || v.payments.length === 0)
      return toast.error("Add at least one payment.");
    if (
      v.payments.some(
        (p) => !p?.paymentMethodId?.trim() || !(Number(p.amount) > 0),
      )
    ) {
      return toast.error("Each payment must have a method and amount > 0.");
    }
    if (!(totalPaid + 1e-9 >= subtotal)) {
      return toast.error(
        `Insufficient payment: required ${money4(subtotal)}, received ${money4(totalPaid)}.`,
      );
    }

    checkout.mutate(v, {
      onSuccess: (res) => {
        toast.success("Checkout completed.");
        router.push(`/receipts/${res.orderId}`);
      },
      onError: (e: unknown) => toast.error(errorMessage(e)),
    });
  }

  return (
    <div className="space-y-4">
      <SettingsStrip
        form={form}
        tenants={tenants}
        locations={locations}
        sessions={sessions}
        customers={customers}
        settingsOpen={settingsOpen}
        setSettingsOpen={setSettingsOpen}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7 xl:col-span-7 space-y-4">
          <div className="rounded-xl border border-border bg-background">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="section-label flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-mint" />
                Cart
                <span className="text-muted">({items.fields.length})</span>
              </h3>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearCart}
                  disabled={items.fields.length === 0}
                >
                  <Trash2 className="mr-1 h-3.5 w-3.5" />
                  Clear
                </Button>
              </div>
            </div>

            <div className="max-h-[38vh] overflow-y-auto">
              {items.fields.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 px-4 text-center gap-2">
                  <Package className="h-8 w-8 text-muted" />
                  <p className="text-sm text-muted">
                    No items yet. Tap a product on the right to add it.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {items.fields.map((f, idx) => {
                    const it = watchedItems[idx];
                    const variantId = String(it?.variantId ?? "");
                    const meta = lineMeta[variantId + ":" + idx];
                    const qty = Number(it?.quantity) || 0;
                    const disc = Number(it?.lineDiscount) || 0;
                    const unitPrice = meta?.unitPrice ?? 0;
                    const lineTotal = unitPrice * qty - disc;
                    const isActive = activeLineIndex === idx;
                    return (
                      <li
                        key={f.id}
                        onClick={() => setActiveLineIndex(idx)}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors",
                          isActive
                            ? "bg-mint/10 border-l-2 border-l-mint"
                            : "hover:bg-mint/5 border-l-2 border-l-transparent",
                        )}
                      >
                        <div className="relative h-12 w-12 shrink-0 rounded-md overflow-hidden bg-muted/30 border border-border">
                          {meta?.productImage ? (
                            <Image
                              src={resolveProductImageSrc(meta.productImage)}
                              alt={meta?.productName ?? ""}
                              fill
                              className="object-cover"
                              sizes="48px"
                              unoptimized
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-[10px] text-muted">
                              No image
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium truncate">
                            {meta?.productName ?? "Item"}
                          </div>
                          <div className="text-xs text-muted truncate">
                            {meta?.variantSku ?? variantId} · {money(unitPrice)}
                          </div>
                        </div>
                        <div
                          className={cn(
                            "shrink-0 w-16 text-center rounded-md border px-2 py-1 font-mono text-sm",
                            isActive
                              ? "border-mint bg-mint/20 text-foreground"
                              : "border-border bg-muted/20 text-muted",
                          )}
                        >
                          × {qty}
                        </div>
                        <div className="w-24 text-right shrink-0 font-medium">
                          {money(lineTotal)}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            items.remove(idx);
                            if (activeLineIndex === idx)
                              setActiveLineIndex(null);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-muted" />
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-background p-4 space-y-3">
              <h3 className="section-label">Number pad</h3>
              <p className="text-xs text-muted">
                {activeLineIndex == null
                  ? "Select a cart line to edit its quantity."
                  : `Editing line #${activeLineIndex + 1} quantity.`}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  "7",
                  "8",
                  "9",
                  "4",
                  "5",
                  "6",
                  "1",
                  "2",
                  "3",
                  ".",
                  "0",
                  "<",
                ].map((k) => (
                  <Button
                    key={k}
                    type="button"
                    variant="outline"
                    className="h-12 text-base font-medium"
                    onClick={() => numpadPress(k)}
                    disabled={activeLineIndex == null}
                  >
                    {k === "<" ? <Delete className="h-4 w-4" /> : k}
                  </Button>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 col-span-3 text-base font-medium"
                  onClick={() => numpadPress("C")}
                  disabled={activeLineIndex == null}
                >
                  Clear qty
                </Button>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-background p-4 space-y-3">
              <h3 className="section-label">Totals</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted">Subtotal</span>
                  <span className="font-medium">{money4(netSubtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">Tax</span>
                  <span className="font-medium">{money4(taxTotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">Total paid</span>
                  <span className="font-medium">{money4(totalPaid)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">Change due</span>
                  <span className="font-medium">{money4(changeDue)}</span>
                </div>
                <div className="pt-2 border-t border-border flex items-center justify-between">
                  <span className="text-sm font-semibold">Grand total</span>
                  <span className="text-lg font-semibold text-mint">
                    {money4(subtotal)}
                  </span>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  if (watchedPayments.length === 1) {
                    form.setValue(
                      "payments.0.amount",
                      Number(subtotal.toFixed(4)),
                    );
                    toast.success("Exact amount set.");
                  } else {
                    toast.error(
                      "Exact amount only works with a single payment line.",
                    );
                  }
                }}
                disabled={subtotal <= 0}
              >
                Exact amount
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-background p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="section-label flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-mint" />
                Payments
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  payments.append({
                    paymentMethodId: "",
                    amount: 0,
                    transactionReference: "",
                  })
                }
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                Add
              </Button>
            </div>
            <div className="space-y-3">
              {payments.fields.map((f, idx) => (
                <div
                  key={f.id}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-2"
                >
                  <div className="sm:col-span-5">
                    <Controller
                      control={form.control}
                      name={`payments.${idx}.paymentMethodId` as const}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Method" />
                          </SelectTrigger>
                          <SelectContent>
                            {paymentMethods.map((m) => (
                              <SelectItem
                                key={String(m.id)}
                                value={String(m.id)}
                              >
                                {m.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <Input
                      type="number"
                      step="0.0001"
                      placeholder="Amount"
                      {...form.register(`payments.${idx}.amount` as const, {
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <Input
                      placeholder="Reference (optional)"
                      {...form.register(
                        `payments.${idx}.transactionReference` as const,
                      )}
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <Button
                      type="button"
                      variant="destructive"
                      className="w-full"
                      onClick={() => payments.remove(idx)}
                      disabled={payments.fields.length === 1}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button
            type="button"
            onClick={form.handleSubmit(onSubmit)}
            disabled={checkout.isPending || items.fields.length === 0}
            className="w-full h-14 text-base font-semibold bg-mint text-gloss-black hover:bg-mint-hover"
          >
            {checkout.isPending ? "Processing..." : `Charge ${money4(subtotal)}`}
          </Button>
        </div>

        <div className="lg:col-span-5 xl:col-span-5">
          <div className="rounded-xl border border-border bg-background p-4 space-y-4 sticky top-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                <Input
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search products..."
                  className="pl-9"
                />
              </div>
            </div>

            {productsLoading ? (
              <AppLoader
                fullScreen={false}
                size="sm"
                message="Loading products..."
              />
            ) : filteredProducts.length === 0 ? (
              <p className="text-sm text-muted text-center py-8">
                {selectedTenantId
                  ? "No products for this tenant."
                  : "Select a tenant to load products."}
              </p>
            ) : (
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 max-h-[70vh] overflow-y-auto">
                {filteredProducts.map((p) => (
                  <button
                    key={String(p.id)}
                    type="button"
                    onClick={() => onProductClick(p)}
                    className="rounded-xl border border-border hover:border-mint/40 hover:bg-mint/5 transition-colors overflow-hidden text-left flex flex-col"
                  >
                    <div className="relative aspect-4/3 bg-muted/30 overflow-hidden">
                      {p.imageUrl ? (
                        <Image
                          src={resolveProductImageSrc(p.imageUrl)}
                          alt={p.name}
                          fill
                          className="object-cover"
                          sizes="(min-width: 1280px) 33vw, (min-width: 1024px) 33vw, 50vw"
                          unoptimized
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-xs text-muted">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="p-2.5 flex-1 flex flex-col gap-1">
                      <div className="font-medium leading-tight line-clamp-2 text-sm">
                        {p.name}
                      </div>
                      <div className="mt-auto flex items-center justify-between gap-2">
                        <span className="text-[11px] text-muted truncate">
                          {p.baseSku}
                        </span>
                        <span className="text-sm font-semibold text-mint">
                          {money(
                            (() => {
                              const unit = Number(p.basePrice) || 0;
                              const taxable = Boolean(p.isTaxable);
                              const rate = p.taxRateRatePercentage ?? 0;
                              const inclusive = Boolean(p.taxRateIsPriceInclusive);
                              if (!taxable) return unit;
                              if (inclusive) return unit;
                              return unit + calcTax(unit, rate, false);
                            })(),
                          )}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <VariantPickerModal
        isOpen={variantPickerProductId != null}
        onClose={() => setVariantPickerProductId(null)}
        product={selectedProduct}
        variants={variants}
        variantsLoading={variantsLoading}
        onPickVariant={(v) => {
          if (selectedProduct) addVariantToCart(selectedProduct, v);
        }}
      />
    </div>
  );
}

function SettingsStrip({
  form,
  tenants,
  locations,
  sessions,
  customers,
  settingsOpen,
  setSettingsOpen,
}: {
  form: ReturnType<typeof useForm<FormValues>>;
  tenants: { id: string | number; name: string }[];
  locations: { id: string | number; name?: string }[];
  sessions: { id: string | number; status?: string }[];
  customers: { id: string | number; name?: string; email?: string }[];
  settingsOpen: boolean;
  setSettingsOpen: (v: boolean) => void;
}) {
  const selectedTenant = useWatch({ control: form.control, name: "tenantId" });
  const selectedLocation = useWatch({
    control: form.control,
    name: "locationId",
  });
  const selectedSession = useWatch({
    control: form.control,
    name: "posSessionId",
  });
  const selectedCustomer = useWatch({
    control: form.control,
    name: "customerId",
  });

  const tenantName =
    tenants.find((t) => String(t.id) === String(selectedTenant))?.name ?? "—";
  const locationName =
    locations.find((l) => String(l.id) === String(selectedLocation))?.name ??
    "—";
  const sessionLabel = selectedSession
    ? `${sessions.find((s) => String(s.id) === String(selectedSession))?.status ?? ""} · ${String(selectedSession).slice(0, 8)}…`
    : "—";
  const customerName = selectedCustomer
    ? (customers.find((c) => String(c.id) === String(selectedCustomer))?.name ??
      customers.find((c) => String(c.id) === String(selectedCustomer))?.email ??
      "—")
    : "Walk-in";

  return (
    <div className="rounded-xl border border-border bg-background">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-4 text-sm flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="text-muted">Tenant:</span>
            <span className="font-medium">{tenantName}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-muted">Location:</span>
            <span className="font-medium">{locationName}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-muted">Session:</span>
            <span className="font-medium">{sessionLabel}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-muted">Customer:</span>
            <span className="font-medium">{customerName}</span>
          </span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setSettingsOpen(!settingsOpen)}
        >
          <Settings2 className="mr-1 h-3.5 w-3.5" />
          {settingsOpen ? "Hide settings" : "Settings"}
        </Button>
      </div>

      {settingsOpen ? (
        <div className="border-t border-border p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label>Tenant</Label>
            <Controller
              control={form.control}
              name="tenantId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tenant" />
                  </SelectTrigger>
                  <SelectContent>
                    {tenants.map((t) => (
                      <SelectItem key={String(t.id)} value={String(t.id)}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="grid gap-2">
            <Label>Location</Label>
            <Controller
              control={form.control}
              name="locationId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((l) => (
                      <SelectItem key={String(l.id)} value={String(l.id)}>
                        {String(l.name ?? "—")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="grid gap-2">
            <Label>POS session</Label>
            <Controller
              control={form.control}
              name="posSessionId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select POS session" />
                  </SelectTrigger>
                  <SelectContent>
                    {sessions.map((s) => (
                      <SelectItem key={String(s.id)} value={String(s.id)}>
                        {String(s.status ?? "—")} · {String(s.id)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="grid gap-2">
            <Label>Sales channel</Label>
            <Controller
              control={form.control}
              name="salesChannel"
              render={({ field }) => (
                <Select
                  value={String(field.value)}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select channel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="POS">POS</SelectItem>
                    <SelectItem value="ONLINE">ONLINE</SelectItem>
                    <SelectItem value="PHONE">PHONE</SelectItem>
                    <SelectItem value="OTHER">OTHER</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="grid gap-2">
            <Label>Customer (optional)</Label>
            <Controller
              control={form.control}
              name="customerId"
              render={({ field }) => (
                <Select
                  value={field.value ? String(field.value) : "__none__"}
                  onValueChange={(val) =>
                    field.onChange(val === "__none__" ? null : val)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Walk-in customer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Walk-in customer</SelectItem>
                    {customers.map((c) => (
                      <SelectItem key={String(c.id)} value={String(c.id)}>
                        {String(c.name ?? c.email ?? c.id)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="grid gap-2">
            <Label className="flex items-center gap-1.5">
              <KeyRound className="h-3.5 w-3.5 text-muted" />
              Idempotency key
            </Label>
            <div className="flex gap-2">
              <Input
                className="font-mono text-xs"
                {...form.register("idempotencyKey")}
                placeholder="550e8400-e29b-41d4-a716-446655440000"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  form.setValue("idempotencyKey", newIdempotencyKey())
                }
                title="Generate a new key"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function VariantPickerModal({
  isOpen,
  onClose,
  product,
  variants,
  variantsLoading,
  onPickVariant,
}: {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  variants: ProductVariant[];
  variantsLoading: boolean;
  onPickVariant: (v: ProductVariant) => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => (!open ? onClose() : null)}>
      <DialogContent maxWidth="2xl" className="p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border bg-mint/5">
          <DialogTitle className="panel-header text-xl tracking-tight text-foreground">
            {product ? `Choose variant — ${product.name}` : "Choose variant"}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {!product ? null : variantsLoading ? (
            <AppLoader
              fullScreen={false}
              size="sm"
              message="Loading variants..."
            />
          ) : variants.length === 0 ? (
            <p className="text-sm text-muted">
              No variants found for this product.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {variants.map((v) => {
                const baseUnit =
                  (Number(product.basePrice) || 0) + (Number(v.priceModifier) || 0);
                const price = (() => {
                  const taxable = Boolean(product.isTaxable);
                  const rate = product.taxRateRatePercentage ?? 0;
                  const inclusive = Boolean(product.taxRateIsPriceInclusive);
                  if (!taxable) return baseUnit;
                  if (inclusive) return baseUnit;
                  return baseUnit + calcTax(baseUnit, rate, false);
                })();
                const opts = v.matrixOptions
                  ? Object.entries(v.matrixOptions)
                      .map(([k, val]) => `${k}: ${val}`)
                      .join(" · ")
                  : "";
                return (
                  <button
                    key={String(v.id)}
                    type="button"
                    onClick={() => onPickVariant(v)}
                    className="rounded-xl border border-border hover:border-mint/40 hover:bg-mint/5 transition-colors overflow-hidden text-left p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium truncate">
                          {v.variantSku}
                        </div>
                        <div className="mt-1 text-xs text-muted line-clamp-2">
                          {opts || "—"}
                        </div>
                      </div>
                      <div className="text-sm font-medium">{money(price)}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-border/80 bg-background/50 flex justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
