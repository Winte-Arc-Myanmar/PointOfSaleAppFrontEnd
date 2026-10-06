"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
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
import { AppLoader } from "@/presentation/components/loader";
import { useCreateProduct, useUpdateProduct } from "@/presentation/hooks/useProducts";
import { useCreateProductFormOptions } from "@/presentation/hooks/useCreateProductFormOptions";
import { useTaxRates } from "@/presentation/hooks/useTaxRates";
import { usePermissions } from "@/presentation/hooks/usePermissions";
import { getPaginatedItems } from "@/presentation/hooks/pagination";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useLanguage } from "@/presentation/providers/LanguageProvider";
import { apiErrorMessage } from "@/lib/api-error";
import { cn } from "@/lib/utils";
import { toProductDto } from "@/core/application/mappers/ProductMapper";
import type { ProductDto } from "@/core/application/dtos/ProductDto";
import type { Product } from "@/core/domain/entities/Product";
import type { PosType } from "@/core/domain/entities/PosReport";
import { ProductImageField } from "../ProductImageField";
import { PlacePicker } from "../ProductKindFields";
import { autoSku, pickUom, quickTerms, TAB_OF, type QuickType } from "./quick-product";

const NONE = "__none__";

function Choice({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-1.5 text-sm transition-colors",
        selected ? "border-mint bg-mint/15 font-medium" : "border-border text-muted hover:border-mint/60",
      )}
    >
      {children}
    </button>
  );
}

const TITLES = { menu: "addProduct.newMenu", hostess: "addProduct.newHostess", rate: "addProduct.newRate" } as const;
const NAME_HINTS = {
  menu: "addProduct.menuNamePlaceholder",
  hostess: "addProduct.hostessNamePlaceholder",
  rate: "addProduct.rateNamePlaceholder",
} as const;

/**
 * A short form for one kind of product: food & drink, a hostess service, or a room
 * or table charge. It asks only what staff would know and sets the rest itself.
 */
export function QuickProductForm({ type, product }: { type: QuickType; product?: Product }) {
  const router = useRouter();
  const toast = useToast();
  const { t } = useLanguage();
  const { tenantId: myTenantId } = usePermissions();
  const { data: options, isLoading } = useCreateProductFormOptions();
  const { data: taxData } = useTaxRates({ page: 1, limit: 100 });
  const create = useCreateProduct();
  const update = useUpdateProduct();

  const [tenantId, setTenantId] = useState(product?.tenantId ?? myTenantId ?? "");
  const [name, setName] = useState(product?.name ?? "");
  const [price, setPrice] = useState(product ? String(product.basePrice) : "");
  const [categoryId, setCategoryId] = useState(product?.categoryId || "");
  const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? "");
  const [taxRateId, setTaxRateId] = useState(product?.taxRateId ?? "");
  const [soldAt, setSoldAt] = useState<PosType[]>(product?.soldAt ?? []);
  const [perHour, setPerHour] = useState(product ? product.soldBy === "TIME" : true);
  const [rents, setRents] = useState<"KTV_ROOM" | "SPA_ROOM" | "TABLE">(product?.rents ?? "KTV_ROOM");
  const [placeIds, setPlaceIds] = useState<string[]>(product?.rentalPlaceIds ?? []);
  const [blockMinutes, setBlockMinutes] = useState(product?.timeBlockMinutes ?? 60);
  const [minimumBlocks, setMinimumBlocks] = useState(String(product?.minimumBlocks ?? 1));
  const [errors, setErrors] = useState<{ name?: string; price?: string }>({});

  const tenants = options?.tenants ?? [];
  const tenant = tenantId || (tenants.length === 1 ? String(tenants[0].id) : "");
  const categories = useMemo(
    () => (options?.categories ?? []).filter((c) => !tenant || String(c.tenantId) === tenant),
    [options?.categories, tenant],
  );
  const taxRates = getPaginatedItems(taxData).filter((r) => !tenant || String(r.tenantId) === tenant);
  const isSaving = create.isPending || update.isPending;

  const toggleArea = (area: PosType) =>
    setSoldAt((current) => (current.includes(area) ? current.filter((a) => a !== area) : [...current, area]));

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const amount = Number(price);
    const nextErrors = {
      ...(name.trim() ? {} : { name: t("addProduct.nameRequired") }),
      ...(price.trim() !== "" && amount >= 0 ? {} : { price: t("addProduct.priceRequired") }),
    };
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length || !tenant) return;

    const terms = quickTerms(type, {
      soldAt,
      perHour,
      rents,
      rentalPlaceIds: placeIds,
      blockMinutes,
      minimumBlocks: Number(minimumBlocks) || 1,
    });
    const shared = {
      name: name.trim(),
      basePrice: amount,
      imageUrl: imageUrl.trim() || null,
      isTaxable: Boolean(taxRateId),
      taxRateId: taxRateId || null,
      ...terms,
    };
    const base = product
      ? { ...toProductDto(product), ...shared }
      : {
          ...shared,
          tenantId: tenant,
          baseSku: autoSku(type),
          baseUomId: String(pickUom(options?.uoms ?? [], terms.soldBy === "TIME")?.id ?? ""),
          trackingType: type === "menu" ? "STANDARD" : "SERVICE",
          globalAttributes: {},
        };
    const payload = { ...base, categoryId } as Omit<ProductDto, "id"> & { id?: string };
    delete payload.id;
    if (!categoryId) delete (payload as Partial<ProductDto>).categoryId;

    const done = {
      onSuccess: () => {
        toast.success(t("addProduct.saved"));
        router.push(TAB_OF[type]);
      },
      onError: (error: unknown) => toast.error(apiErrorMessage(error, t("addProduct.couldNotSave"))),
    };
    if (product) update.mutate({ id: String(product.id), data: payload }, done);
    else create.mutate(payload, done);
  };

  if (isLoading) return <AppLoader fullScreen={false} size="sm" message="..." />;

  return (
    <form onSubmit={submit} className="max-w-2xl space-y-6" noValidate>
      <div className="flex items-center gap-4">
        <Link href={TAB_OF[type]}>
          <Button type="button" variant="ghost" size="icon" aria-label={t("addProduct.back")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="panel-header text-xl tracking-tight">
          {product ? t("addProduct.editTitle").replace("{name}", product.name) : t(TITLES[type])}
        </h1>
      </div>

      {!myTenantId && tenants.length > 1 && !product ? (
        <div className="grid gap-1 sm:w-1/2">
          <Label>Tenant</Label>
          <Select value={tenantId} onValueChange={(v) => v && setTenantId(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Tenant" />
            </SelectTrigger>
            <SelectContent>
              {tenants.map((item) => (
                <SelectItem key={String(item.id)} value={String(item.id)}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="grid gap-1">
          <Label htmlFor="quick-name">{t("addProduct.name")}</Label>
          <Input
            id="quick-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t(NAME_HINTS[type])}
          />
          {errors.name ? <p className="text-sm text-red-600">{errors.name}</p> : null}
        </div>
        <div className="grid gap-1">
          <Label htmlFor="quick-price">
            {type === "menu" || (type === "hostess" && !perHour) ? t("addProduct.price") : t("addProduct.pricePerHour")}
          </Label>
          <Input
            id="quick-price"
            type="number"
            min={0}
            inputMode="decimal"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0"
          />
          {errors.price ? <p className="text-sm text-red-600">{errors.price}</p> : null}
        </div>
      </div>

      {type === "hostess" ? (
        <section className="space-y-2">
          <p className="text-sm font-medium">{t("addProduct.chargedHow")}</p>
          <div className="flex flex-wrap gap-2">
            <Choice selected={perHour} onClick={() => setPerHour(true)}>
              {t("addProduct.perHour")}
            </Choice>
            <Choice selected={!perHour} onClick={() => setPerHour(false)}>
              {t("addProduct.perCall")}
            </Choice>
          </div>
          <p className="text-xs text-muted">
            {t("addProduct.hostessNote")}{" "}
            <Link href="/hostesses" className="text-mint underline">
              {t("addProduct.manageHostesses")} →
            </Link>
          </p>
        </section>
      ) : null}

      {type === "rate" ? (
        <section className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">{t("addProduct.rentsWhat")}</p>
            <div className="flex flex-wrap gap-2">
              {(["KTV_ROOM", "SPA_ROOM", "TABLE"] as const).map((place) => (
                <Choice
                  key={place}
                  selected={rents === place}
                  onClick={() => {
                    if (place !== rents) setPlaceIds([]);
                    setRents(place);
                  }}
                >
                  {t(
                    place === "KTV_ROOM"
                      ? "addProduct.ktvRoom"
                      : place === "SPA_ROOM"
                        ? "addProduct.spaRoom"
                        : "addProduct.tableOrRoom",
                  )}
                </Choice>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">
              {t(
                rents === "KTV_ROOM"
                  ? "addProduct.whichRooms"
                  : rents === "SPA_ROOM"
                    ? "addProduct.whichSpaRooms"
                    : "addProduct.whichTables",
              )}
            </p>
            <PlacePicker rents={rents} tenantId={tenant} value={placeIds} onChange={setPlaceIds} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-medium">{t("addProduct.chargeEvery")}</p>
              <div className="flex flex-wrap gap-2">
                <Choice selected={blockMinutes === 60} onClick={() => setBlockMinutes(60)}>
                  {t("addProduct.perHour")}
                </Choice>
                <Choice selected={blockMinutes === 30} onClick={() => setBlockMinutes(30)}>
                  {t("addProduct.perHalfHour")}
                </Choice>
              </div>
            </div>
            <div className="grid gap-1">
              <Label htmlFor="quick-minimum">{t("addProduct.minimumHours")}</Label>
              <Input
                id="quick-minimum"
                type="number"
                min={1}
                max={100}
                value={minimumBlocks}
                onChange={(e) => setMinimumBlocks(e.target.value)}
                className="w-28"
              />
            </div>
          </div>
        </section>
      ) : null}

      {type === "menu" ? (
        <section className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">{t("addProduct.soldAt")}</p>
            <div className="flex flex-wrap gap-2">
              <Choice selected={soldAt.length === 0} onClick={() => setSoldAt([])}>
                {t("addProduct.everywhere")}
              </Choice>
              {(["BAR", "KTV", "SPA"] as PosType[]).map((area) => (
                <Choice key={area} selected={soldAt.includes(area)} onClick={() => toggleArea(area)}>
                  {area === "BAR" ? t("addProduct.restaurant") : area}
                </Choice>
              ))}
            </div>
          </div>
          <div className="grid gap-1 sm:w-1/2">
            <Label>{t("addProduct.category")}</Label>
            <Select value={categoryId || NONE} onValueChange={(v) => setCategoryId(!v || v === NONE ? "" : v)}>
              <SelectTrigger>
                <SelectValue placeholder={t("addProduct.noCategory")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>{t("addProduct.noCategory")}</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={String(c.id)} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <ProductImageField value={imageUrl} onChange={setImageUrl} id="quick-product-image" />
        </section>
      ) : null}

      <div className="grid gap-1 sm:w-1/2">
        <Label>{t("addProduct.tax")}</Label>
        <Select value={taxRateId || NONE} onValueChange={(v) => setTaxRateId(!v || v === NONE ? "" : v)}>
          <SelectTrigger>
            <SelectValue placeholder={t("addProduct.noTax")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE}>{t("addProduct.noTax")}</SelectItem>
            {taxRates.map((rate) => (
              <SelectItem key={String(rate.id)} value={String(rate.id)}>
                {rate.name} ({Number(rate.ratePercentage) * (Number(rate.ratePercentage) <= 1 ? 100 : 1)}%)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? t("addProduct.saving") : t("addProduct.save")}
        </Button>
        <Link
          href={product ? `/products/${product.id}/edit/advanced` : `/products/new/advanced`}
          className="text-sm text-muted underline"
        >
          {t("addProduct.advanced")}
        </Link>
      </div>
    </form>
  );
}
