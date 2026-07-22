"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  Settings2,
  KeyRound,
  CreditCard,
  RefreshCw,
  Package,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  User,
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
import { Modal } from "@/presentation/components/modal/Modal";
import { AppLoader } from "@/presentation/components/loader";
import { cn } from "@/lib/utils";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useCurrency } from "@/presentation/providers/CurrencyProvider";
import { ProductCardImage } from "@/presentation/components/product/ProductCardImage";
import { useConfirm } from "@/presentation/hooks/useConfirm";
import { usePermissions } from "@/presentation/hooks/usePermissions";
import { useTenants } from "@/presentation/hooks/useTenants";
import { useLocations } from "@/presentation/hooks/useLocations";
import { usePosSessions } from "@/presentation/hooks/usePosSessions";
import { useCustomers } from "@/presentation/hooks/useCustomers";
import { usePaymentMethods } from "@/presentation/hooks/usePaymentMethods";
import { useCategories } from "@/presentation/hooks/useCategories";
import { useProducts } from "@/presentation/hooks/useProducts";
import { useProductVariants } from "@/presentation/hooks/useProductVariants";
import { useCheckoutProcess } from "@/presentation/hooks/useCheckout";
import { usePromotionRules } from "@/presentation/hooks/usePromotionRules";
import { getPaginatedItems } from "@/presentation/hooks/pagination";
import {
  calcLineTotals,
  calcTax,
} from "@/core/application/business-rules/checkout/checkoutCalculations";
import type { CheckoutRequestDto } from "@/core/application/dtos/CheckoutDto";
import type { Category } from "@/core/domain/entities/Category";
import type { Product } from "@/core/domain/entities/Product";
import type { PromotionRule } from "@/core/domain/entities/PromotionRule";
import type { ProductVariant } from "@/core/domain/entities/ProductVariant";
import {
  PosRightSidebarCart,
  type PosOrderType,
} from "./PosRightSidebarCart";

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

function formatLoginTime(value: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(value);
}

function resolveStoredLoginTime(storageKey: string): Date {
  if (typeof window === "undefined") return new Date();

  try {
    const stored = window.sessionStorage.getItem(storageKey);
    if (stored) {
      const parsed = new Date(stored);
      if (Number.isFinite(parsed.getTime())) return parsed;
    }

    const now = new Date();
    window.sessionStorage.setItem(storageKey, now.toISOString());
    return now;
  } catch {
    return new Date();
  }
}

type FormValues = CheckoutRequestDto;

interface LineMeta {
  productName: string;
  productImage?: string | null;
  variantSku: string;
  categoryName?: string;
  modifierLabel?: string;
  unitPrice: number;
  isTaxable: boolean;
  taxRate: number;
  isPriceInclusive: boolean;
}

export function CheckoutSection() {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const { formatPrice: formatCurrencyPrice } = useCurrency();
  const { data: session } = useSession();
  const { tenantId } = usePermissions();
  const checkout = useCheckoutProcess();

  const { data: tenantsResult } = useTenants();
  const { data: allLocationsResult } = useLocations({ page: 1, limit: 200 });
  const { data: allSessionsResult } = usePosSessions({
    page: 1,
    limit: 200,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const { data: allCustomersResult } = useCustomers({ page: 1, limit: 50 });
  const { data: allPaymentMethodsResult } = usePaymentMethods({
    page: 1,
    limit: 200,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const { data: categoriesResult } = useCategories({ page: 1, limit: 200 });
  const { data: productsResult, isLoading: productsLoading } = useProducts({
    page: 1,
    limit: 200,
  });
  const { data: promotionRulesResult } = usePromotionRules({
    page: 1,
    limit: 200,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const tenants = getPaginatedItems(tenantsResult);
  const allLocations = getPaginatedItems(allLocationsResult);
  const allSessions = getPaginatedItems(allSessionsResult);
  const allCustomers = getPaginatedItems(allCustomersResult);
  const allPaymentMethods = getPaginatedItems(allPaymentMethodsResult);
  const allCategories = getPaginatedItems(categoriesResult);
  const products = getPaginatedItems(productsResult);
  const allPromotionRules = getPaginatedItems(promotionRulesResult);

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
  const selectedTenantCurrency =
    tenants.find((tenant) => String(tenant.id) === String(selectedTenantId))
      ?.baseCurrency ?? "MMK";
  const formatPrice = useCallback(
    (value: number) => formatCurrencyPrice(value, selectedTenantCurrency),
    [formatCurrencyPrice, selectedTenantCurrency],
  );
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
  const categories = useMemo(
    () =>
      (selectedTenantId
        ? allCategories.filter(
            (category) =>
              String(category.tenantId) === String(selectedTenantId),
          )
        : allCategories
      ).sort((a, b) => a.name.localeCompare(b.name)),
    [allCategories, selectedTenantId],
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
  const [selectedCategoryId, setSelectedCategoryId] = useState("__all__");
  const [orderType, setOrderType] = useState<PosOrderType>("dine-in");
  const [tableNumber, setTableNumber] = useState("Table #1");
  const [giftCode, setGiftCode] = useState("");
  const [promotionCode, setPromotionCode] = useState("");
  const [selectedPromotionRuleId, setSelectedPromotionRuleId] = useState<
    string | null
  >(null);
  const [loginTime, setLoginTime] = useState<Date | null>(null);

  useEffect(() => {
    if (
      selectedCategoryId !== "__all__" &&
      !categories.some(
        (category) => String(category.id) === String(selectedCategoryId),
      )
    ) {
      setSelectedCategoryId("__all__");
    }
  }, [categories, selectedCategoryId]);

  useEffect(() => {
    if (orderType === "dine-in") {
      setTableNumber((current) => current || "Table #1");
      return;
    }
    setTableNumber("");
  }, [orderType]);

  const activePromotionRules = useMemo(() => {
    const now = Date.now();
    return (selectedTenantId
      ? allPromotionRules.filter(
          (rule) => String(rule.tenantId) === String(selectedTenantId),
        )
      : allPromotionRules
    ).filter((rule) => {
      const start = Date.parse(rule.startDate);
      const end = Date.parse(rule.endDate);
      if (!Number.isFinite(start) || !Number.isFinite(end)) return true;
      return start <= now && now <= end;
    });
  }, [allPromotionRules, selectedTenantId]);

  const selectedPromotionRule = useMemo(() => {
    if (!selectedPromotionRuleId) return null;
    return (
      activePromotionRules.find(
        (rule) => String(rule.id) === String(selectedPromotionRuleId),
      ) ?? null
    );
  }, [activePromotionRules, selectedPromotionRuleId]);

  useEffect(() => {
    if (
      selectedPromotionRuleId &&
      !activePromotionRules.some(
        (rule) => String(rule.id) === String(selectedPromotionRuleId),
      )
    ) {
      setSelectedPromotionRuleId(null);
      setPromotionCode("");
    }
  }, [activePromotionRules, selectedPromotionRuleId]);

  function handlePromotionCodeChange(value: string) {
    setPromotionCode(value);
    const normalized = value.trim().toLowerCase();
    if (!normalized) {
      setSelectedPromotionRuleId(null);
      return;
    }

    const matchedRule = activePromotionRules.find(
      (rule) => rule.name.trim().toLowerCase() === normalized,
    );
    setSelectedPromotionRuleId(matchedRule ? String(matchedRule.id) : null);
  }

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

  const { data: variantsResult, isLoading: variantsLoading } =
    useProductVariants(variantPickerProductId, { page: 1, limit: 200 });
  const variants = getPaginatedItems(variantsResult);

  const shouldShowVariantPicker =
    variantPickerProductId != null &&
    selectedProduct != null &&
    !variantsLoading &&
    variants.length > 1;

  const filteredProducts = useMemo(() => {
    const s = productSearch.trim().toLowerCase();
    const base = Array.isArray(products) ? products : [];
    const byTenant = selectedTenantId
      ? base.filter((p) => String(p.tenantId) === String(selectedTenantId))
      : base;
    const byCategory =
      selectedCategoryId === "__all__"
        ? byTenant
        : byTenant.filter(
            (p) => String(p.categoryId) === String(selectedCategoryId),
          );
    if (!s) return byCategory;
    return byCategory.filter((p) => {
      const hay = `${p.name} ${p.baseSku}`.toLowerCase();
      return hay.includes(s);
    });
  }, [products, productSearch, selectedCategoryId, selectedTenantId]);

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
          categoryName: product.categoryName ?? "Menu item",
          modifierLabel: variant.variantSku,
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

  useEffect(() => {
    if (!variantPickerProductId || !selectedProduct || variantsLoading) return;

    if (variants.length === 1) {
      addVariantToCart(selectedProduct, variants[0]);
      return;
    }

    if (variants.length === 0) {
      setVariantPickerProductId(null);
      toast.error("No variants found for this product.");
    }
  }, [
    variantPickerProductId,
    selectedProduct,
    variantsLoading,
    variants,
    addVariantToCart,
    toast,
  ]);

  function setQty(index: number, value: number) {
    form.setValue(`items.${index}.quantity`, Math.max(0, value));
  }

  function incrementItem(index: number) {
    const currentQty = Number(form.getValues(`items.${index}.quantity`)) || 0;
    setQty(index, currentQty + 1);
  }

  function decrementItem(index: number) {
    const currentQty = Number(form.getValues(`items.${index}.quantity`)) || 0;
    if (currentQty <= 1) {
      items.remove(index);
      if (activeLineIndex === index) setActiveLineIndex(null);
      return;
    }
    setQty(index, currentQty - 1);
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
        `Insufficient payment: required ${formatPrice(subtotal)}, received ${formatPrice(totalPaid)}.`,
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

  const sessionUser = session?.user as
    | { name?: string | null; email?: string | null; image?: string | null }
    | undefined;
  const sessionAccessToken =
    typeof session?.accessToken === "string" ? session.accessToken : "";
  const profileName = sessionUser?.name ?? sessionUser?.email ?? "Current user";
  const profileInitial = profileName.trim().charAt(0).toUpperCase() || "U";
  const loginStorageKey = useMemo(() => {
    const identity = sessionUser?.email?.trim() || profileName.trim() || "guest";
    const sessionScope = sessionAccessToken.trim() || "anonymous-session";
    return `pos-login-time:${identity.toLowerCase()}:${sessionScope}`;
  }, [profileName, sessionAccessToken, sessionUser?.email]);

  useEffect(() => {
    setLoginTime(resolveStoredLoginTime(loginStorageKey));
  }, [loginStorageKey]);

  const loginTimeLabel = loginTime ? formatLoginTime(loginTime) : "";
  const orderNumber = form
    .getValues("idempotencyKey")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(-4)
    .toUpperCase()
    .padStart(4, "0");
  const availableTables = [
    "Table #1",
    "Table #2",
    "Table #3",
    "Table #4",
    "Table #5",
    "Patio #1",
    "VIP #1",
  ];
  const sidebarItems = watchedItems.map((it, idx) => {
    const variantId = String(it?.variantId ?? "");
    const meta = lineMeta[variantId + ":" + idx];
    const quantity = Number(it?.quantity) || 0;
    const discount = Number(it?.lineDiscount) || 0;
    const lineTotal = (meta?.unitPrice ?? 0) * quantity - discount;
    return {
      id: `${variantId}:${idx}`,
      category: meta?.categoryName ?? "Menu item",
      name: meta?.productName ?? "Item",
      modifier:
        meta?.modifierLabel && meta.modifierLabel !== meta.productName
          ? meta.modifierLabel
          : undefined,
      quantity,
      price: lineTotal,
    };
  });

  function formatPromotionRuleMeta(rule: PromotionRule | null): string | null {
    if (!rule) return null;
    const rewardType = rule.rewardAction?.type ?? "";
    const rewardValue = Number(rule.rewardAction?.value ?? 0);
    if (rewardType === "PERCENTAGE_DISCOUNT") {
      return `${rewardValue}% off from Promotion Rules`;
    }
    if (rewardType === "FIXED_AMOUNT_DISCOUNT") {
      return `${formatPrice(rewardValue)} off from Promotion Rules`;
    }
    if (rewardType === "FIXED_PRICE") {
      return `Fixed price ${formatPrice(rewardValue)} from Promotion Rules`;
    }
    return rewardType
      ? `${rewardType} from Promotion Rules`
      : "Bound to Promotion Rules";
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3 shadow-[var(--shadow-panel)]">
        <div>
          <p className="section-label">Checkout profile</p>
          <p className="text-sm text-muted">
            Active cashier for this checkout screen.
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-border bg-mint/5 px-3 py-2">
          <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-mint/15 text-sm font-semibold text-mint">
            {sessionUser?.image ? (
              <Image
                src={sessionUser.image}
                alt={profileName}
                fill
                className="object-cover"
                sizes="44px"
                unoptimized
              />
            ) : (
              profileInitial
            )}
          </div>
          <div className="min-w-0 space-y-0.5">
            <p className="max-w-44 truncate text-sm font-medium text-foreground">
              {profileName}
            </p>
            <p className="flex items-center gap-1 text-xs text-muted">
              <User className="h-3.5 w-3.5" />
              Cashier profile
            </p>
            {loginTimeLabel ? (
              <p
                className="text-xs text-gray-400 dark:text-muted"
                title={`Logged in: ${loginTimeLabel}`}
              >
                Logged in: {loginTimeLabel}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <SettingsStrip
        form={form}
        tenants={tenants}
        locations={locations}
        sessions={sessions}
        customers={customers}
        settingsOpen={settingsOpen}
        setSettingsOpen={setSettingsOpen}
      />
      <div className="grid min-h-0 grid-cols-1 gap-4 lg:grid-cols-12 lg:items-start">
        <div className="order-1 min-h-0 space-y-4 lg:col-span-5 xl:col-span-4">
          <PosRightSidebarCart
            currency={selectedTenantCurrency}
            orderNumber={orderNumber}
            tableNumber={tableNumber}
            staffName={profileName}
            orderType={orderType}
            tableOptions={availableTables}
            items={sidebarItems}
            giftCode={giftCode}
            promotionCode={promotionCode}
            promotionOptions={activePromotionRules.map((rule) => ({
              id: String(rule.id),
              label: rule.name,
            }))}
            promotionMeta={formatPromotionRuleMeta(selectedPromotionRule)}
            summary={{
              subtotal: netSubtotal,
              discount: 0,
              serviceCharge: 0,
              tax: taxTotal,
              total: subtotal,
            }}
            onOrderTypeChange={setOrderType}
            onTableNumberChange={setTableNumber}
            onGiftCodeChange={setGiftCode}
            onPromotionCodeChange={handlePromotionCodeChange}
            onPrint={() => {
              if (typeof window !== "undefined") {
                window.print();
              }
            }}
            onPrimaryAction={form.handleSubmit(onSubmit)}
            primaryActionDisabled={checkout.isPending || items.fields.length === 0}
            primaryActionLabel={
              checkout.isPending ? "Processing..." : "Pay Now"
            }
            printDisabled={items.fields.length === 0}
          />
          {false ? (
            <>
          <div className="rounded-xl border border-border bg-background shadow-[var(--shadow-panel)]">
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
                          "flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-3 py-3 transition-colors",
                          isActive
                            ? "bg-mint/10 border-l-2 border-l-mint"
                            : "hover:bg-mint/5 border-l-2 border-l-transparent",
                        )}
                      >
                        <div className="relative h-12 w-12 shrink-0 rounded-lg overflow-hidden bg-muted/20 border border-border">
                          <ProductCardImage
                            src={meta?.productImage}
                            alt={meta?.productName ?? "Product"}
                            sizes="48px"
                            imageClassName="object-cover"
                            logoClassName="w-7"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold truncate text-foreground">
                            {meta?.productName ?? "Item"}
                          </div>
                          <div className="text-xs text-muted truncate">
                            {meta?.variantSku ?? variantId} · {formatPrice(unitPrice)}
                          </div>
                        </div>
                        <div className="shrink-0 flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 dark:bg-white/10">
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 rounded-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              decrementItem(idx);
                            }}
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </Button>
                          <span className="w-8 text-center text-sm font-semibold tabular-nums text-foreground">
                            {qty}
                          </span>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 rounded-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              incrementItem(idx);
                            }}
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        <div className="min-w-[96px] text-right text-base font-bold tabular-nums text-foreground">
                          {formatPrice(lineTotal)}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-full text-muted hover:text-red-600 dark:hover:text-red-400"
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

          <div className="rounded-xl border border-border bg-background p-5 shadow-[var(--shadow-panel)] space-y-4">
              <h3 className="section-label">Totals</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted">Subtotal</span>
                  <span className="font-medium">{formatPrice(netSubtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">Tax</span>
                  <span className="font-medium">{formatPrice(taxTotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">Total paid</span>
                  <span className="font-medium">{formatPrice(totalPaid)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">Change due</span>
                  <span className="font-medium">{formatPrice(changeDue)}</span>
                </div>
                <div className="pt-2 border-t border-border flex items-center justify-between">
                  <span className="text-sm font-semibold">Grand total</span>
                  <span className="text-2xl font-bold text-mint">
                    {formatPrice(subtotal)}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  className="h-12"
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
                <Button
                  type="button"
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={checkout.isPending || items.fields.length === 0}
                  className="h-12 md:h-14 text-base font-semibold bg-mint text-gloss-black hover:bg-mint-hover"
                >
                  {checkout.isPending
                    ? "Processing..."
                    : "Pay now"}
                </Button>
              </div>
          </div>

            </>
          ) : null}

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

        </div>

        <div className="order-2 lg:col-span-7 xl:col-span-8">
          <div className="rounded-xl border border-border bg-background p-4 shadow-[var(--shadow-panel)] space-y-4 sticky top-4">
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

            <CategoryChooser
              categories={categories}
              selectedCategoryId={selectedCategoryId}
              onSelectCategory={setSelectedCategoryId}
            />

            <div className="space-y-1">
              <h3 className="text-lg font-semibold tracking-tight">
                Special Menu for you
              </h3>
              <p className="text-sm text-muted">
                Pick an item to add it to the current order.
              </p>
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
                  ? selectedCategoryId === "__all__"
                    ? "No products for this tenant."
                    : "No products in this category."
                  : "Select a tenant to load products."}
              </p>
            ) : (
              <div
                className="visible-scrollbar grid max-h-[70vh] grid-cols-2 gap-4 overflow-y-auto pr-2 touch-pan-y md:grid-cols-3 xl:grid-cols-4"
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                {filteredProducts.map((p) => (
                  <button
                    key={String(p.id)}
                    type="button"
                    onClick={() => onProductClick(p)}
                    className="group flex flex-col rounded-[28px] border border-gray-200 bg-white px-4 pb-4 pt-5 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:border-mint/50 hover:shadow-md dark:border-border dark:bg-background"
                  >
                    <div className="relative mx-auto mb-4 flex h-24 w-full max-w-[112px] items-center justify-center overflow-hidden rounded-2xl bg-transparent">
                      <ProductCardImage
                        src={p.imageUrl}
                        alt={p.name}
                        sizes="112px"
                        className="overflow-hidden rounded-2xl"
                        imageClassName="transition-transform duration-200 group-hover:scale-105"
                        logoClassName="w-12"
                      />
                    </div>
                    <div className="flex flex-1 flex-col">
                      <div className="min-h-[2.75rem] text-sm font-semibold leading-snug text-foreground line-clamp-2">
                        {p.name}
                      </div>
                      <div className="mt-2 text-sm font-medium text-muted">
                        {formatPrice(
                          (() => {
                            const unit = Number(p.basePrice) || 0;
                            const taxable = Boolean(p.isTaxable);
                            const rate = p.taxRateRatePercentage ?? 0;
                            const inclusive = Boolean(
                              p.taxRateIsPriceInclusive,
                            );
                            if (!taxable) return unit;
                            if (inclusive) return unit;
                            return unit + calcTax(unit, rate, false);
                          })(),
                        )}
                      </div>
                      <div className="mt-4 flex items-center rounded-full bg-mint px-2 py-1.5 text-white shadow-sm dark:text-gloss-black">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
                          <Plus className="h-4 w-4" />
                        </span>
                        <span className="flex-1 text-center text-sm font-semibold tracking-wide">
                          ADD
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
        isOpen={shouldShowVariantPicker}
        onClose={() => setVariantPickerProductId(null)}
        product={selectedProduct}
        variants={variants}
        variantsLoading={variantsLoading}
        formatPrice={formatPrice}
        onPickVariant={(v) => {
          if (selectedProduct) addVariantToCart(selectedProduct, v);
        }}
      />
    </div>
  );
}

function CategoryChooser({
  categories,
  selectedCategoryId,
  onSelectCategory,
}: {
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (value: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const updateScrollState = () => {
      const maxScrollLeft = el.scrollWidth - el.clientWidth;
      setCanScrollLeft(el.scrollLeft > 4);
      setCanScrollRight(maxScrollLeft - el.scrollLeft > 4);
    };

    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [categories]);

  function scrollByAmount(direction: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;

    const amount = Math.max(220, Math.floor(el.clientWidth * 0.6));
    el.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }

  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-4 w-4 text-mint" />
          <h3 className="section-label">Category</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => scrollByAmount("left")}
            disabled={!canScrollLeft}
            aria-label="Scroll categories left"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => scrollByAmount("right")}
            disabled={!canScrollRight}
            aria-label="Scroll categories right"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="hide-scrollbar flex gap-2 overflow-x-auto overflow-y-hidden pb-1 touch-pan-x"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <Button
          type="button"
          variant={selectedCategoryId === "__all__" ? "default" : "outline"}
          className="h-14 shrink-0 px-5"
          onClick={() => onSelectCategory("__all__")}
        >
          All
        </Button>
        {categories.map((category) => {
          const isActive = String(category.id) === String(selectedCategoryId);
          return (
            <Button
              key={String(category.id)}
              type="button"
              variant={isActive ? "default" : "outline"}
              className="h-14 shrink-0 px-5"
              onClick={() => onSelectCategory(String(category.id))}
            >
              {category.name}
            </Button>
          );
        })}
      </div>
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
  formatPrice,
  onPickVariant,
}: {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  variants: ProductVariant[];
  variantsLoading: boolean;
  formatPrice: (value: number) => string;
  onPickVariant: (v: ProductVariant) => void;
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product ? `Choose variant — ${product.name}` : "Choose variant"}
      maxWidth="2xl"
      flush
      headerVariant="mint"
      animateClose
      bodyClassName="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto"
      footer={
        <Button type="button" variant="secondary" onClick={onClose}>
          Close
        </Button>
      }
    >
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
              (Number(product.basePrice) || 0) +
              (Number(v.priceModifier) || 0);
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
                  <div className="text-sm font-medium">{formatPrice(price)}</div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </Modal>
  );
}

