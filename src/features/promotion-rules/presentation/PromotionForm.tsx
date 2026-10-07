"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Check,
  Clock,
  Flower2,
  FolderTree,
  LayoutGrid,
  ListChecks,
  Search,
  UserRound,
  UtensilsCrossed,
  X,
  type LucideIcon,
} from "lucide-react";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { useCategories } from "@/presentation/hooks/useCategories";
import { useLocations } from "@/presentation/hooks/useLocations";
import { usePermissions } from "@/presentation/hooks/usePermissions";
import { useProducts } from "@/presentation/hooks/useProducts";
import { getPaginatedItems } from "@/presentation/hooks/pagination";
import { useLanguage } from "@/presentation/providers/LanguageProvider";
import type { TranslationKey } from "@/presentation/i18n/translations";
import container from "@/core/infrastructure/di/container";
import type { IProductVariantService } from "@/core/domain/services/IProductVariantService";
import type { Product } from "@/core/domain/entities/Product";
import type { ProductVariant } from "@/core/domain/entities/ProductVariant";
import type {
  PromotionDiscountType,
  PromotionGroup,
  PromotionItem,
  PromotionRule,
  PromotionScope,
} from "@/core/domain/entities/PromotionRule";
import type { PromotionRuleInput } from "@/core/application/dtos/PromotionRuleDto";
import type { PosType } from "@/core/domain/entities/PosReport";
import { cn } from "@/lib/utils";
import {
  isCharge,
  isHostessService,
  isMenuProduct,
  isSpaPackage,
} from "@/features/products/presentation/ProductList";

type Errors = Partial<Record<"name" | "value" | "scope" | "hours" | "dates", string>>;

const DISCOUNT_TYPES = [
  { value: "PERCENT_OFF", title: "promoForm.percentOff", hint: "promoForm.percentOffHint" },
  { value: "AMOUNT_OFF", title: "promoForm.amountOff", hint: "promoForm.amountOffHint" },
  { value: "FREE_TIME", title: "promoForm.freeTime", hint: "promoForm.freeTimeHint" },
] as const satisfies readonly { value: PromotionDiscountType; title: TranslationKey; hint: TranslationKey }[];

const GROUPS: { value: PromotionGroup; label: TranslationKey; icon: LucideIcon; has: (p: Product) => boolean }[] = [
  { value: "FOOD_DRINK", label: "promoForm.foodDrink", icon: UtensilsCrossed, has: isMenuProduct },
  { value: "HOSTESS", label: "promoForm.hostess", icon: UserRound, has: isHostessService },
  { value: "SPA_PACKAGE", label: "promoForm.spaPackages", icon: Flower2, has: isSpaPackage },
  { value: "ROOM_TIME", label: "promoForm.roomTime", icon: Clock, has: isCharge },
];

const DAYS: { value: number; label: TranslationKey }[] = [
  { value: 1, label: "promoForm.mon" },
  { value: 2, label: "promoForm.tue" },
  { value: 3, label: "promoForm.wed" },
  { value: 4, label: "promoForm.thu" },
  { value: 5, label: "promoForm.fri" },
  { value: 6, label: "promoForm.sat" },
  { value: 0, label: "promoForm.sun" },
];

const POS: { value: PosType; label: TranslationKey | null; text: string }[] = [
  { value: "BAR", label: "promoForm.restaurant", text: "" },
  { value: "SPA", label: null, text: "SPA" },
  { value: "KTV", label: null, text: "KTV" },
];

/** Free time is given on what is sold by time, and on SPA packages. */
const givesTime = (p: Product) => p.soldBy === "TIME" || isSpaPackage(p);

/** What the picker shows as chosen: the product's own name, or with its option in brackets. */
const isChosen = (p: Product, items: PromotionItem[]) =>
  items.some((i) => i.name === p.name || i.name.startsWith(`${p.name} (`));

const FieldError = ({ message }: { message?: string }) =>
  message ? <p className="text-sm text-red-600">{message}</p> : null;

function Chip({
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
        "rounded-full border px-3 py-1 text-sm transition-colors",
        selected ? "border-mint bg-mint/15 font-medium" : "border-border text-muted hover:border-mint/60",
      )}
    >
      {children}
    </button>
  );
}

/** A big button with an icon and a short word: what a promotion covers. */
function BigChoice({
  icon: Icon,
  label,
  selected,
  onClick,
  small,
}: {
  icon: LucideIcon;
  label: string;
  selected: boolean;
  onClick: () => void;
  small?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-2 rounded-xl border text-left text-sm font-medium transition-colors",
        small ? "px-3 py-2" : "flex-col justify-center px-2 py-4 text-center",
        selected ? "border-mint bg-mint/15" : "border-border hover:border-mint/60",
      )}
    >
      {selected ? <Check className="absolute right-2 top-2 size-4 text-mint" /> : null}
      <Icon className={cn(small ? "size-4" : "size-6", selected ? "text-mint" : "text-muted")} />
      <span>{label}</span>
    </button>
  );
}

/** Products in tabs like the products page; tap to add, tap again to take off. */
function ItemPicker({
  items,
  onChange,
  freeTime,
}: {
  items: PromotionItem[];
  onChange: (items: PromotionItem[]) => void;
  freeTime: boolean;
}) {
  const { t } = useLanguage();
  const { tenantId } = usePermissions();
  const queryClient = useQueryClient();
  const { data: productsData } = useProducts({ page: 1, limit: 500 });
  const tabs = GROUPS.filter((g) => !freeTime || g.value !== "FOOD_DRINK");
  const [tab, setTab] = useState<PromotionGroup>(tabs[0].value);
  const [search, setSearch] = useState("");
  const [choosing, setChoosing] = useState<{ product: Product; variants: ProductVariant[] } | null>(null);
  const group = tabs.find((g) => g.value === tab) ?? tabs[0];

  const products = (productsData?.items ?? []).filter(
    (p) =>
      !p.deletedAt &&
      (!tenantId || String(p.tenantId) === tenantId) &&
      group.has(p) &&
      (!freeTime || givesTime(p)) &&
      p.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  const nameOf = (product: Product, variant: ProductVariant) => {
    const options = Object.values(variant.matrixOptions ?? {}).join(" / ");
    return options ? `${product.name} (${options})` : product.name;
  };

  const toggleVariant = (product: Product, variant: ProductVariant) => {
    const variantId = String(variant.id);
    onChange(
      items.some((i) => i.variantId === variantId)
        ? items.filter((i) => i.variantId !== variantId)
        : [...items, { variantId, name: nameOf(product, variant) }],
    );
  };

  const tap = async (product: Product) => {
    const productId = String(product.id);
    const result = await queryClient.fetchQuery({
      queryKey: ["products", productId, "variants", 1, 50],
      queryFn: () =>
        container.resolve<IProductVariantService>("productVariantService").getAll(productId, { page: 1, limit: 50 }),
    });
    const variants = result.items.filter((v) => !v.deletedAt);
    if (variants.length === 1) {
      toggleVariant(product, variants[0]);
      setChoosing(null);
    } else if (variants.length > 1) {
      setChoosing({ product, variants });
    }
  };

  return (
    <div className="space-y-3 rounded-xl border border-border p-3">
      {items.length ? (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <span
              key={item.variantId}
              className="inline-flex items-center gap-1 rounded-full border border-mint bg-mint/15 py-1 pl-3 pr-1 text-sm"
            >
              {item.name}
              <button
                type="button"
                aria-label={`${t("promoForm.remove")} ${item.name}`}
                className="rounded-full p-0.5 hover:bg-mint/30"
                onClick={() => onChange(items.filter((i) => i.variantId !== item.variantId))}
              >
                <X className="size-3.5" />
              </button>
            </span>
          ))}
        </div>
      ) : null}

      <div role="tablist" className="flex flex-wrap gap-1 border-b border-border pb-2">
        {tabs.map((g) => (
          <button
            key={g.value}
            type="button"
            role="tab"
            aria-selected={tab === g.value}
            onClick={() => {
              setTab(g.value);
              setChoosing(null);
            }}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm",
              tab === g.value ? "bg-mint/15 font-medium" : "text-muted hover:bg-mint/10",
            )}
          >
            <g.icon className="size-4" />
            {t(g.label)}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <Input
          aria-label={t("promoForm.search")}
          placeholder={t("promoForm.search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {choosing ? (
        <div className="space-y-2 rounded-lg bg-mint/5 p-3">
          <p className="text-sm font-medium">
            {choosing.product.name} · {t("promoForm.chooseOption")}
          </p>
          <div className="flex flex-wrap gap-2">
            {choosing.variants.map((v) => (
              <Chip
                key={String(v.id)}
                selected={items.some((i) => i.variantId === String(v.id))}
                onClick={() => toggleVariant(choosing.product, v)}
              >
                {Object.values(v.matrixOptions ?? {}).join(" / ") || v.variantSku}
              </Chip>
            ))}
          </div>
        </div>
      ) : null}

      {products.length ? (
        <div className="grid max-h-72 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">
          {products.map((p) => {
            const chosen = isChosen(p, items);
            return (
              <button
                key={String(p.id)}
                type="button"
                aria-pressed={chosen}
                onClick={() => void tap(p)}
                className={cn(
                  "flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-sm",
                  chosen ? "border-mint bg-mint/15 font-medium" : "border-border hover:border-mint/60",
                )}
              >
                <span className="truncate">{p.name}</span>
                {chosen ? <Check className="size-4 shrink-0 text-mint" /> : null}
              </button>
            );
          })}
        </div>
      ) : (
        <p className="py-2 text-sm text-muted">{t("promoForm.noneHere")}</p>
      )}
    </div>
  );
}

/** Where a promotion's choice sits: everything, some groups, categories, or items. */
type Coverage = "EVERYTHING" | "GROUPS" | "CATEGORIES" | "ITEMS";

function coverageOf(rule?: PromotionRule): Coverage {
  if (!rule) return "EVERYTHING";
  if (rule.appliesTo === "CATEGORIES") return "CATEGORIES";
  if (rule.appliesTo === "ITEMS") return "ITEMS";
  return rule.productGroups.length ? "GROUPS" : "EVERYTHING";
}

export function PromotionForm({
  formId,
  rule,
  onSubmit,
}: {
  formId: string;
  rule?: PromotionRule;
  onSubmit: (data: PromotionRuleInput) => void;
}) {
  const { t } = useLanguage();
  const { tenantId } = usePermissions();
  const { data: categoriesData } = useCategories({ page: 1, limit: 500 });
  const { data: locationsData } = useLocations({ page: 1, limit: 200 });
  const locations = getPaginatedItems(locationsData).filter(
    (l) => !l.deletedAt && (!tenantId || String(l.tenantId) === tenantId),
  );

  const categories = useMemo(() => {
    const all = getPaginatedItems(categoriesData).filter(
      (c) =>
        !c.deletedAt &&
        (!tenantId || String(c.tenantId) === tenantId),
    );
    const byParent = new Map<string | null, typeof all>();
    for (const c of all) {
      const key = c.parentId && all.some((p) => String(p.id) === c.parentId) ? c.parentId : null;
      byParent.set(key, [...(byParent.get(key) ?? []), c]);
    }
    const ordered: { id: string; name: string; depth: number }[] = [];
    const walk = (parent: string | null, depth: number) => {
      for (const c of (byParent.get(parent) ?? []).sort((a, b) => a.name.localeCompare(b.name))) {
        ordered.push({ id: String(c.id), name: c.name, depth });
        walk(String(c.id), depth + 1);
      }
    };
    walk(null, 0);
    return ordered;
  }, [categoriesData, tenantId]);

  const [name, setName] = useState(rule?.name ?? "");
  const [discountType, setDiscountType] = useState<PromotionDiscountType>(rule?.discountType ?? "PERCENT_OFF");
  const [value, setValue] = useState(rule && rule.discountType !== "FREE_TIME" ? String(rule.discountValue) : "");
  const [buyUnits, setBuyUnits] = useState(String(rule?.buyUnits ?? 1));
  const [freeUnits, setFreeUnits] = useState(String(rule?.freeUnits ?? 1));
  const freeTime = discountType === "FREE_TIME";
  const [coverage, setCoverage] = useState<Coverage>(coverageOf(rule));
  const [groups, setGroups] = useState<PromotionGroup[]>(rule?.productGroups ?? []);
  const [categoryIds, setCategoryIds] = useState<string[]>(rule?.categoryIds ?? []);
  const [items, setItems] = useState<PromotionItem[]>(rule?.items ?? []);
  const [posTypes, setPosTypes] = useState<PosType[]>(rule?.posTypes ?? []);
  const [locationIds, setLocationIds] = useState<string[]>(rule?.locationIds ?? []);
  const [startsOn, setStartsOn] = useState(rule?.startsOn ?? "");
  const [endsOn, setEndsOn] = useState(rule?.endsOn ?? "");
  const [days, setDays] = useState<number[]>(rule?.daysOfWeek ?? []);
  const [allDay, setAllDay] = useState(!(rule?.startTime && rule?.endTime));
  const [startTime, setStartTime] = useState(rule?.startTime ?? "17:00");
  const [endTime, setEndTime] = useState(rule?.endTime ?? "19:00");
  const [priority, setPriority] = useState(String(rule?.priorityLevel ?? 0));
  const [isActive, setIsActive] = useState(rule?.isActive ?? true);
  const [errors, setErrors] = useState<Errors>({});

  const groupChoices = GROUPS.filter((g) => !freeTime || g.value !== "FOOD_DRINK");
  const shownGroups = coverage === "GROUPS" ? groups.filter((g) => groupChoices.some((c) => c.value === g)) : [];

  const toggle = <T,>(list: T[], item: T) =>
    list.includes(item) ? list.filter((x) => x !== item) : [...list, item];

  const toggleGroup = (group: PromotionGroup) => {
    const next = toggle(shownGroups, group);
    if (!next.length || next.length === groupChoices.length) {
      setCoverage("EVERYTHING");
      setGroups([]);
    } else {
      setCoverage("GROUPS");
      setGroups(next);
    }
  };

  const appliesTo: PromotionScope =
    coverage === "CATEGORIES" ? "CATEGORIES" : coverage === "ITEMS" ? "ITEMS" : "ALL_ITEMS";

  const summary =
    coverage === "EVERYTHING"
      ? t(freeTime ? "promoForm.everythingTime" : "promoForm.everything")
      : coverage === "GROUPS"
        ? GROUPS.filter((g) => shownGroups.includes(g.value)).map((g) => t(g.label)).join(" · ")
        : coverage === "CATEGORIES"
          ? categories.filter((c) => categoryIds.includes(c.id)).map((c) => c.name).join(" · ") || "—"
          : items.map((i) => i.name).join(" · ") || "—";

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const e: Errors = {};
    const amount = Number(value);
    if (!name.trim()) e.name = t("promoForm.nameError");
    const buy = Number(buyUnits);
    const free = Number(freeUnits);
    if (freeTime) {
      if (!(Number.isInteger(buy) && buy >= 1 && Number.isInteger(free) && free >= 1)) {
        e.value = t("promoForm.unitsError");
      }
    } else if (!(amount > 0)) e.value = t("promoForm.valueError");
    else if (discountType === "PERCENT_OFF" && amount > 100) e.value = t("promoForm.percentError");
    if (coverage === "CATEGORIES" && !categoryIds.length) e.scope = t("promoForm.categoriesError");
    if (coverage === "ITEMS" && !items.length) e.scope = t("promoForm.itemsError");
    if (!allDay && startTime === endTime) e.hours = t("promoForm.hoursError");
    if (startsOn && endsOn && endsOn < startsOn) e.dates = t("promoForm.datesError");
    setErrors(e);
    if (Object.keys(e).length) return;
    onSubmit({
      name: name.trim(),
      discountType,
      ...(freeTime ? { buyUnits: buy, freeUnits: free } : { discountValue: amount }),
      appliesTo,
      productGroups: shownGroups,
      categoryIds: coverage === "CATEGORIES" ? categoryIds : [],
      variantIds: coverage === "ITEMS" ? items.map((i) => i.variantId) : [],
      posTypes,
      locationIds,
      startsOn: startsOn || null,
      endsOn: endsOn || null,
      daysOfWeek: days.length === 7 ? [] : days,
      startTime: allDay ? null : startTime,
      endTime: allDay ? null : endTime,
      priorityLevel: Math.max(0, Math.round(Number(priority) || 0)),
      isActive,
    });
  };

  return (
    <form id={formId} onSubmit={submit} className="space-y-6" noValidate>
      <div className="grid gap-1">
        <Label htmlFor="promo-name">{t("promoForm.name")}</Label>
        <Input
          id="promo-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("promoForm.namePlaceholder")}
        />
        <FieldError message={errors.name} />
      </div>

      <section className="space-y-3">
        <p className="text-sm font-semibold">{t("promoForm.dealTitle")}</p>
        <div role="radiogroup" className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {DISCOUNT_TYPES.map((o) => (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={discountType === o.value}
              onClick={() => setDiscountType(o.value)}
              className={cn(
                "rounded-xl border p-3 text-left",
                discountType === o.value ? "border-mint bg-mint/15" : "border-border hover:border-mint/60",
              )}
            >
              <span className="block text-sm font-medium">{t(o.title)}</span>
              <span className="block text-xs text-muted">{t(o.hint)}</span>
            </button>
          ))}
        </div>
        {freeTime ? (
          <div className="flex flex-wrap items-end gap-3">
            <div className="grid gap-1">
              <Label htmlFor="promo-buy">{t("promoForm.buy")}</Label>
              <Input id="promo-buy" type="number" min={1} className="w-24" value={buyUnits} onChange={(e) => setBuyUnits(e.target.value)} />
            </div>
            <span className="pb-2 text-lg text-muted">+</span>
            <div className="grid gap-1">
              <Label htmlFor="promo-free">{t("promoForm.getFree")}</Label>
              <Input id="promo-free" type="number" min={1} className="w-24" value={freeUnits} onChange={(e) => setFreeUnits(e.target.value)} />
            </div>
            <p className="pb-2 text-xs text-muted">{t("promoForm.freeExplain")}</p>
          </div>
        ) : (
          <div className="grid gap-1 sm:w-[180px]">
            <Label htmlFor="promo-value">{t(discountType === "PERCENT_OFF" ? "promoForm.percent" : "promoForm.amount")}</Label>
            <div className="flex items-center gap-2">
              <Input
                id="promo-value"
                type="number"
                min={0}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={discountType === "PERCENT_OFF" ? "20" : "1000"}
              />
              {discountType === "PERCENT_OFF" ? <span className="text-sm text-muted">%</span> : null}
            </div>
          </div>
        )}
        <FieldError message={errors.value} />
      </section>

      <section className="space-y-3">
        <p className="text-sm font-semibold">{t("promoForm.whatTitle")}</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          <BigChoice
            icon={LayoutGrid}
            label={t(freeTime ? "promoForm.everythingTime" : "promoForm.everything")}
            selected={coverage === "EVERYTHING"}
            onClick={() => {
              setCoverage("EVERYTHING");
              setGroups([]);
            }}
          />
          {groupChoices.map((g) => (
            <BigChoice
              key={g.value}
              icon={g.icon}
              label={t(g.label)}
              selected={shownGroups.includes(g.value)}
              onClick={() => toggleGroup(g.value)}
            />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted">{t("promoForm.orPick")}</span>
          <BigChoice
            small
            icon={FolderTree}
            label={t("promoForm.pickCategories")}
            selected={coverage === "CATEGORIES"}
            onClick={() => setCoverage("CATEGORIES")}
          />
          <BigChoice
            small
            icon={ListChecks}
            label={t("promoForm.pickItems")}
            selected={coverage === "ITEMS"}
            onClick={() => setCoverage("ITEMS")}
          />
        </div>

        {coverage === "CATEGORIES" ? (
          <div className="flex flex-wrap gap-2 rounded-xl border border-border p-3">
            {categories.length ? (
              categories.map((c) => (
                <Chip
                  key={c.id}
                  selected={categoryIds.includes(c.id)}
                  onClick={() => setCategoryIds(toggle(categoryIds, c.id))}
                >
                  {c.depth ? `${"· ".repeat(c.depth)}${c.name}` : c.name}
                </Chip>
              ))
            ) : (
              <p className="text-sm text-muted">{t("promoForm.noneHere")}</p>
            )}
          </div>
        ) : null}
        {coverage === "ITEMS" ? <ItemPicker items={items} onChange={setItems} freeTime={freeTime} /> : null}

        <p className="rounded-lg bg-mint/10 px-3 py-2 text-sm">
          <span className="text-muted">{t("promoForm.gets")}</span> <span className="font-medium">{summary}</span>
        </p>
        <FieldError message={errors.scope} />
      </section>

      <section className="space-y-3 rounded-xl border border-border p-4">
        <div>
          <p className="text-sm font-semibold">{t("promoForm.whenTitle")}</p>
          <p className="text-xs text-muted">{t("promoForm.whenHint")}</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="grid gap-1">
            <Label htmlFor="promo-from">{t("promoForm.startDate")}</Label>
            <Input id="promo-from" type="date" value={startsOn} onChange={(e) => setStartsOn(e.target.value)} />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="promo-to">{t("promoForm.endDate")}</Label>
            <Input id="promo-to" type="date" value={endsOn} onChange={(e) => setEndsOn(e.target.value)} />
          </div>
        </div>
        <FieldError message={errors.dates} />
        <div className="grid gap-2">
          <Label>{t("promoForm.days")}</Label>
          <div className="flex flex-wrap gap-2">
            <Chip selected={days.length === 0} onClick={() => setDays([])}>
              {t("promoForm.everyDay")}
            </Chip>
            {DAYS.map((d) => (
              <Chip key={d.value} selected={days.includes(d.value)} onClick={() => setDays(toggle(days, d.value))}>
                {t(d.label)}
              </Chip>
            ))}
          </div>
        </div>
        <div className="grid gap-2">
          <Label>{t("promoForm.hours")}</Label>
          <div className="flex flex-wrap items-center gap-2">
            <Chip selected={allDay} onClick={() => setAllDay(true)}>
              {t("promoForm.allDay")}
            </Chip>
            <Chip selected={!allDay} onClick={() => setAllDay(false)}>
              {t("promoForm.setHours")}
            </Chip>
            {!allDay ? (
              <div className="flex items-center gap-2">
                <Input
                  aria-label={t("promoForm.startDate")}
                  type="time"
                  className="w-32"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
                <span className="text-sm text-muted">–</span>
                <Input
                  aria-label={t("promoForm.endDate")}
                  type="time"
                  className="w-32"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            ) : null}
          </div>
          {!allDay && endTime < startTime ? <p className="text-xs text-muted">{t("promoForm.pastMidnight")}</p> : null}
          <FieldError message={errors.hours} />
        </div>
      </section>

      <section className="space-y-3">
        <p className="text-sm font-semibold">{t("promoForm.whereTitle")}</p>
        <div className="flex flex-wrap gap-2">
          <Chip selected={posTypes.length === 0} onClick={() => setPosTypes([])}>
            {t("promoForm.everywhere")}
          </Chip>
          {POS.map((p) => (
            <Chip key={p.value} selected={posTypes.includes(p.value)} onClick={() => setPosTypes(toggle(posTypes, p.value))}>
              {p.label ? t(p.label) : p.text}
            </Chip>
          ))}
        </div>
        {locations.length > 1 ? (
          <div className="flex flex-wrap gap-2">
            <Chip selected={locationIds.length === 0} onClick={() => setLocationIds([])}>
              {t("promoForm.everyBranch")}
            </Chip>
            {locations.map((l) => (
              <Chip
                key={String(l.id)}
                selected={locationIds.includes(String(l.id))}
                onClick={() => setLocationIds(toggle(locationIds, String(l.id)))}
              >
                {l.name}
              </Chip>
            ))}
          </div>
        ) : null}
      </section>

      <details className="rounded-xl border border-border px-4 py-3 text-sm">
        <summary className="cursor-pointer font-medium">{t("promoForm.priorityTitle")}</summary>
        <div className="mt-3 grid gap-1 sm:max-w-xs">
          <Label htmlFor="promo-priority">{t("promoForm.priority")}</Label>
          <Input
            id="promo-priority"
            type="number"
            min={0}
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          />
          <p className="text-xs text-muted">{t("promoForm.priorityHint")}</p>
        </div>
      </details>

      <label className="flex items-center justify-between gap-4 rounded-xl border border-border px-4 py-3">
        <span>
          <span className="block text-sm font-medium">{t("promoForm.on")}</span>
          <span className="block text-xs text-muted">{t("promoForm.onHint")}</span>
        </span>
        <input type="checkbox" className="size-5" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
      </label>
    </form>
  );
}
