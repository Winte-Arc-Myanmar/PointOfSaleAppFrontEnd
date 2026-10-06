"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
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
import { useCategories } from "@/presentation/hooks/useCategories";
import { useLocations } from "@/presentation/hooks/useLocations";
import { usePermissions } from "@/presentation/hooks/usePermissions";
import { useProducts } from "@/presentation/hooks/useProducts";
import { useProductVariants } from "@/presentation/hooks/useProductVariants";
import { getPaginatedItems } from "@/presentation/hooks/pagination";
import type {
  PromotionDiscountType,
  PromotionItem,
  PromotionRule,
  PromotionScope,
} from "@/core/domain/entities/PromotionRule";
import type { PromotionRuleInput } from "@/core/application/dtos/PromotionRuleDto";
import type { PosType } from "@/core/domain/entities/PosReport";
import { cn } from "@/lib/utils";
import { DAYS, POS_LABEL } from "./promotion-text";
import { KIND_LABEL } from "@/features/products/presentation/product-kind-text";

type Errors = Partial<Record<"name" | "value" | "scope" | "hours" | "dates", string>>;

const DISCOUNT_TYPES = [
  { value: "PERCENT_OFF", title: "Percent off", hint: "e.g. 20% off" },
  { value: "AMOUNT_OFF", title: "Amount off", hint: "Money off each item" },
  { value: "FREE_TIME", title: "Free time", hint: "Buy 1 hour, get 1 free" },
] as const;

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

function Tiles<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; title: string; hint: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div role="radiogroup" className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-lg border p-3 text-left",
            value === o.value ? "border-mint bg-mint/15" : "border-border hover:border-mint/60",
          )}
        >
          <span className="block text-sm font-medium">{o.title}</span>
          <span className="block text-xs text-muted">{o.hint}</span>
        </button>
      ))}
    </div>
  );
}

function AddItem({ onAdd, timeOnly }: { onAdd: (item: PromotionItem) => void; timeOnly: boolean }) {
  const { data: productsData } = useProducts({ page: 1, limit: 500 });
  const products = (productsData?.items ?? []).filter((p) => !timeOnly || p.soldBy === "TIME");
  const [productId, setProductId] = useState("");
  const [chosenVariantId, setVariantId] = useState("");
  const { data: variantsData } = useProductVariants(productId || null, { page: 1, limit: 50 });
  const variants = variantsData?.items ?? [];
  const variantId = chosenVariantId || (variants.length === 1 ? String(variants[0].id) : "");
  const product = products.find((p) => String(p.id) === productId);

  const add = () => {
    if (!product || !variantId) return;
    const variant = variants.find((v) => String(v.id) === variantId);
    const options = variant ? Object.values(variant.matrixOptions ?? {}).join(" / ") : "";
    onAdd({ variantId, name: options ? `${product.name} (${options})` : product.name });
    setProductId("");
    setVariantId("");
  };

  return (
    <div className="grid grid-cols-1 items-end gap-2 sm:grid-cols-[1fr_1fr_auto]">
      <div className="grid gap-1">
        <Label>Item</Label>
        <Select
          value={productId}
          onValueChange={(v) => {
            if (!v) return;
            setProductId(v);
            setVariantId("");
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choose a product" />
          </SelectTrigger>
          <SelectContent>
            {products.map((p) => (
              <SelectItem key={String(p.id)} value={String(p.id)}>
                {p.kind === "ITEM" ? p.name : `${p.name} · ${KIND_LABEL[p.kind]}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-1">
        <Label>Option</Label>
        {variants.length > 1 ? (
          <Select value={variantId} onValueChange={(v) => v && setVariantId(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Choose" />
            </SelectTrigger>
            <SelectContent>
              {variants.map((v) => (
                <SelectItem key={String(v.id)} value={String(v.id)}>
                  {Object.values(v.matrixOptions ?? {}).join(" / ") || v.variantSku}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <p className="py-2 text-sm text-muted">{productId ? "Standard" : "—"}</p>
        )}
      </div>
      <Button type="button" variant="outline" onClick={add} disabled={!product || !variantId}>
        Add
      </Button>
    </div>
  );
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
  const [appliesTo, setAppliesTo] = useState<PromotionScope>(rule?.appliesTo ?? "CATEGORIES");
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

  const toggle = <T,>(list: T[], item: T) =>
    list.includes(item) ? list.filter((x) => x !== item) : [...list, item];

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const e: Errors = {};
    const amount = Number(value);
    if (!name.trim()) e.name = "Give the promotion a name, e.g. Happy hour drinks.";
    const buy = Number(buyUnits);
    const free = Number(freeUnits);
    if (freeTime) {
      if (!(Number.isInteger(buy) && buy >= 1 && Number.isInteger(free) && free >= 1)) {
        e.value = "Enter whole numbers: how many are bought, and how many are free.";
      }
    } else if (!(amount > 0)) e.value = "Enter how much it takes off.";
    else if (discountType === "PERCENT_OFF" && amount > 100) e.value = "A percent off can be at most 100.";
    if (appliesTo === "CATEGORIES" && !categoryIds.length) e.scope = "Choose at least one category.";
    if (appliesTo === "ITEMS" && !items.length) e.scope = "Add at least one item.";
    if (!allDay && startTime === endTime) e.hours = "The start and end time cannot be the same.";
    if (startsOn && endsOn && endsOn < startsOn) e.dates = "The end date is before the start date.";
    setErrors(e);
    if (Object.keys(e).length) return;
    onSubmit({
      name: name.trim(),
      discountType,
      ...(freeTime ? { buyUnits: buy, freeUnits: free } : { discountValue: amount }),
      appliesTo,
      categoryIds: appliesTo === "CATEGORIES" ? categoryIds : [],
      variantIds: appliesTo === "ITEMS" ? items.map((i) => i.variantId) : [],
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
    <form id={formId} onSubmit={submit} className="space-y-5" noValidate>
      <div className="grid gap-1">
        <Label htmlFor="promo-name">Name</Label>
        <Input
          id="promo-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Happy hour drinks 20% off"
        />
        <FieldError message={errors.name} />
      </div>

      <section className="space-y-3">
        <p className="text-sm font-medium">Discount</p>
        <div className="grid gap-3">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {DISCOUNT_TYPES.map((o) => (
              <button
                key={o.value}
                type="button"
                role="radio"
                aria-checked={discountType === o.value}
                onClick={() => setDiscountType(o.value)}
                className={cn(
                  "rounded-lg border p-3 text-left",
                  discountType === o.value ? "border-mint bg-mint/15" : "border-border hover:border-mint/60",
                )}
              >
                <span className="block text-sm font-medium">{o.title}</span>
                <span className="block text-xs text-muted">{o.hint}</span>
              </button>
            ))}
          </div>
          {freeTime ? (
            <div className="flex flex-wrap items-end gap-3">
              <div className="grid gap-1">
                <Label htmlFor="promo-buy">Buy</Label>
                <Input id="promo-buy" type="number" min={1} className="w-24" value={buyUnits} onChange={(e) => setBuyUnits(e.target.value)} />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="promo-free">Get free</Label>
                <Input id="promo-free" type="number" min={1} className="w-24" value={freeUnits} onChange={(e) => setFreeUnits(e.target.value)} />
              </div>
              <p className="pb-2 text-sm text-muted">
                Units of the product&apos;s time, e.g. hours. Buying {Number(buyUnits) || 1} adds {Number(freeUnits) || 1} free.
              </p>
            </div>
          ) : (
            <div className="grid gap-1 sm:w-[180px]">
              <Label htmlFor="promo-value">{discountType === "PERCENT_OFF" ? "Percent" : "Amount"}</Label>
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
        </div>
        <FieldError message={errors.value} />
      </section>

      <section className="space-y-3">
        <p className="text-sm font-medium">Applies to</p>
        <Tiles
          value={appliesTo}
          onChange={setAppliesTo}
          options={[
            { value: "CATEGORIES", title: "Categories", hint: "Sub-categories included" },
            {
              value: "ITEMS",
              title: "Chosen products",
              hint: freeTime ? "Products sold by time, e.g. KTV hours" : "Items, services or rentals you pick",
            },
            {
              value: "ALL_ITEMS",
              title: "Everything",
              hint: freeTime ? "Everything sold by time" : "All items and services; not rentals",
            },
          ]}
        />
        {appliesTo === "CATEGORIES" ? (
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
              <p className="text-sm text-muted">No categories yet.</p>
            )}
          </div>
        ) : null}
        {appliesTo === "ITEMS" ? (
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
                      aria-label={`Remove ${item.name}`}
                      className="rounded-full p-0.5 hover:bg-mint/30"
                      onClick={() => setItems(items.filter((i) => i.variantId !== item.variantId))}
                    >
                      <X className="size-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            ) : null}
            <AddItem
              timeOnly={freeTime}
              onAdd={(item) =>
                setItems((current) =>
                  current.some((i) => i.variantId === item.variantId) ? current : [...current, item],
                )
              }
            />
          </div>
        ) : null}
        <FieldError message={errors.scope} />
      </section>

      <section className="space-y-3 rounded-xl border border-border p-4">
        <div>
          <p className="text-sm font-medium">When it runs</p>
          <p className="text-xs text-muted">Leave a part empty and it doesn&apos;t limit the promotion. Times follow each outlet&apos;s clock.</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="grid gap-1">
            <Label htmlFor="promo-from">Start date (optional)</Label>
            <Input id="promo-from" type="date" value={startsOn} onChange={(e) => setStartsOn(e.target.value)} />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="promo-to">End date (optional)</Label>
            <Input id="promo-to" type="date" value={endsOn} onChange={(e) => setEndsOn(e.target.value)} />
          </div>
        </div>
        <FieldError message={errors.dates} />
        <div className="grid gap-2">
          <Label>Days</Label>
          <div className="flex flex-wrap gap-2">
            <Chip selected={days.length === 0} onClick={() => setDays([])}>
              Every day
            </Chip>
            {DAYS.map((d) => (
              <Chip key={d.value} selected={days.includes(d.value)} onClick={() => setDays(toggle(days, d.value))}>
                {d.short}
              </Chip>
            ))}
          </div>
        </div>
        <div className="grid gap-2">
          <Label>Hours</Label>
          <div className="flex flex-wrap items-center gap-2">
            <Chip selected={allDay} onClick={() => setAllDay(true)}>
              All day
            </Chip>
            <Chip selected={!allDay} onClick={() => setAllDay(false)}>
              Set hours
            </Chip>
            {!allDay ? (
              <div className="flex items-center gap-2">
                <Input
                  aria-label="From"
                  type="time"
                  className="w-32"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
                <span className="text-sm text-muted">to</span>
                <Input
                  aria-label="To"
                  type="time"
                  className="w-32"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            ) : null}
          </div>
          {!allDay && endTime < startTime ? (
            <p className="text-xs text-muted">Runs past midnight, until {endTime} the next morning.</p>
          ) : null}
          <FieldError message={errors.hours} />
        </div>
      </section>

      <section className="space-y-3">
        <div className="grid gap-2">
          <Label>Where</Label>
          <div className="flex flex-wrap gap-2">
            <Chip selected={posTypes.length === 0} onClick={() => setPosTypes([])}>
              Every POS
            </Chip>
            {(["BAR", "SPA", "KTV"] as PosType[]).map((p) => (
              <Chip key={p} selected={posTypes.includes(p)} onClick={() => setPosTypes(toggle(posTypes, p))}>
                {POS_LABEL[p]}
              </Chip>
            ))}
          </div>
          <p className="text-xs text-muted">Bar means every sale that isn&apos;t SPA or KTV: counter, tables and bar.</p>
        </div>
        {locations.length > 1 ? (
          <div className="flex flex-wrap gap-2">
            <Chip selected={locationIds.length === 0} onClick={() => setLocationIds([])}>
              Every outlet
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
        <summary className="cursor-pointer font-medium">Advanced: priority</summary>
        <div className="mt-3 grid gap-1 sm:max-w-xs">
          <Label htmlFor="promo-priority">Priority</Label>
          <Input
            id="promo-priority"
            type="number"
            min={0}
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          />
          <p className="text-xs text-muted">
            When more promotions apply to an item than Venue setup allows, the higher priority wins, then the bigger saving.
          </p>
        </div>
      </details>

      <label className="flex items-center justify-between gap-4 rounded-xl border border-border px-4 py-3">
        <span>
          <span className="block text-sm font-medium">On</span>
          <span className="block text-xs text-muted">Turn off to stop it without deleting it.</span>
        </span>
        <input type="checkbox" className="size-5" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
      </label>
    </form>
  );
}
