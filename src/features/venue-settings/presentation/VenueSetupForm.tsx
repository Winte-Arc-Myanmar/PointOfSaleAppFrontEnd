"use client";

import { useState } from "react";
import { BadgePercent, Banknote, DoorOpen, Mic, Minus, Package, Plus, Receipt, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { AppLoader } from "@/presentation/components/loader";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useLanguage } from "@/presentation/providers/LanguageProvider";
import { useUpdateVenueSettings, useVenueSettings } from "@/presentation/hooks/useVenueSettings";
import { apiErrorMessage } from "@/lib/api-error";
import { cn } from "@/lib/utils";
import { TaxRateSelect } from "@/features/tax-rates/presentation/TaxRateSelect";
import type { PriceCurrency, RoomPaymentTiming, VenueSettingUpdate } from "@/core/domain/entities/VenueSetting";

type Draft = Required<VenueSettingUpdate>;

function Switch({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed",
        checked ? "bg-emerald-500" : "bg-muted-foreground/30",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-5" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

function SwitchRow({
  title,
  hint,
  checked,
  disabled,
  onChange,
}: {
  title: string;
  hint: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-4 py-3", disabled && "opacity-50")}>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-0.5 text-xs text-muted">{hint}</p>
      </div>
      <Switch label={title} checked={checked} disabled={disabled} onChange={onChange} />
    </div>
  );
}

function Section({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted">
        <Icon className="size-4" />
        {title}
      </h2>
      {children}
    </section>
  );
}

function Panel({
  icon: Icon,
  title,
  className,
  children,
}: {
  icon?: LucideIcon;
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("rounded-2xl border border-border bg-background/80 px-5 py-4 shadow-sm", className)}>
      <h3 className="flex items-center gap-2 text-base font-semibold">
        {Icon ? <Icon className="size-5 text-mint" /> : null}
        {title}
      </h3>
      {children}
    </div>
  );
}

function Choice({
  selected,
  onSelect,
  title,
  hint,
  mono,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  hint: string;
  mono?: boolean;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "flex gap-3 rounded-xl border p-4 text-left transition-colors",
        selected ? "border-mint bg-mint/15" : "border-border hover:border-mint/60",
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border",
          selected ? "border-mint" : "border-muted-foreground/40",
        )}
      >
        {selected ? <span className="size-2 rounded-full bg-mint" /> : null}
      </span>
      <span>
        <span className="block text-sm font-semibold">{title}</span>
        <span className={cn("mt-1 block text-xs text-muted", mono && "font-mono")}>{hint}</span>
      </span>
    </button>
  );
}

function Stepper({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  const step = "flex size-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-mint/15 hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent";
  return (
    <div role="group" aria-label={label} className="inline-flex items-center rounded-xl border border-border p-1">
      <button type="button" aria-label="-" className={step} disabled={value <= min} onClick={() => onChange(value - 1)}>
        <Minus className="size-4" />
      </button>
      <output aria-live="polite" className="w-10 text-center text-lg font-semibold tabular-nums">
        {value}
      </output>
      <button type="button" aria-label="+" className={step} disabled={value >= max} onClick={() => onChange(value + 1)}>
        <Plus className="size-4" />
      </button>
    </div>
  );
}

const TIMING = [
  { value: "PAY_WHEN_ORDERING", title: "shopSettings.payEachTime", hint: "shopSettings.payEachTimeHint" },
  { value: "PAY_AT_END", title: "shopSettings.payWhenLeaving", hint: "shopSettings.payWhenLeavingHint" },
] as const satisfies readonly { value: RoomPaymentTiming; title: string; hint: string }[];

const CURRENCIES = [
  { value: "MMK", title: "shopSettings.mmk", sample: "100,000 MMK" },
  { value: "USD", title: "shopSettings.usd", sample: "$ 100,000" },
] as const satisfies readonly { value: PriceCurrency; title: string; sample: string }[];

const LIMIT_FOR = [
  { value: "ITEM", title: "shopSettings.perItem" },
  { value: "BILL", title: "shopSettings.perBill" },
] as const;

export function VenueSetupForm() {
  const toast = useToast();
  const { t } = useLanguage();
  const { data: saved, isLoading, error, refetch } = useVenueSettings();
  const update = useUpdateVenueSettings();
  const [edits, setEdits] = useState<Partial<Draft>>({});

  if (isLoading) {
    return <AppLoader fullScreen={false} size="sm" message="Loading..." />;
  }
  if (error || !saved) {
    return (
      <div className="space-y-3">
        <p className="text-red-500">{apiErrorMessage(error, t("shopSettings.couldNotLoad"))}</p>
        <Button variant="outline" onClick={() => refetch()}>
          {t("shopSettings.tryAgain")}
        </Button>
      </div>
    );
  }

  const draft: Draft = {
    spaEnabled: saved.spaEnabled,
    spaMenuOrdering: saved.spaMenuOrdering,
    ktvEnabled: saved.ktvEnabled,
    ktvMenuOrdering: saved.ktvMenuOrdering,
    paymentTiming: saved.paymentTiming,
    maxPromotionsPerItem: saved.maxPromotionsPerItem ?? 1,
    maxPromotionsPerBill: saved.maxPromotionsPerBill ?? null,
    currency: saved.currency ?? "MMK",
    trackStock: saved.trackStock ?? true,
    defaultTaxRateId: saved.defaultTaxRateId ?? null,
    ...edits,
  };
  const set = (patch: Partial<Draft>) => setEdits({ ...edits, ...patch });
  const perBill = draft.maxPromotionsPerBill !== null;
  const limit = draft.maxPromotionsPerBill ?? draft.maxPromotionsPerItem;
  const changed = (Object.keys(edits) as (keyof Draft)[]).filter((k) => draft[k] !== saved[k]);

  const save = () => {
    const patch = Object.fromEntries(changed.map((k) => [k, draft[k]])) as VenueSettingUpdate;
    update.mutate(patch, {
      onSuccess: () => {
        setEdits({});
        toast.success(t("shopSettings.saved"));
      },
      onError: (err) => toast.error(apiErrorMessage(err, t("shopSettings.couldNotSave"))),
    });
  };

  return (
    <div className="max-w-4xl space-y-8 pb-24">
      <Section icon={DoorOpen} title={t("shopSettings.roomsSection")}>
        <div className="grid gap-4 md:grid-cols-2">
          <Panel icon={Sparkles} title={t("shopSettings.spaCard")}>
            <div className="divide-y divide-border">
              <SwitchRow
                title={t("shopSettings.hasSpa")}
                hint={t("shopSettings.hasSpaHint")}
                checked={draft.spaEnabled}
                onChange={(v) => set({ spaEnabled: v })}
              />
              <SwitchRow
                title={t("shopSettings.spaFood")}
                hint={t("shopSettings.spaFoodHint")}
                checked={draft.spaMenuOrdering}
                disabled={!draft.spaEnabled}
                onChange={(v) => set({ spaMenuOrdering: v })}
              />
            </div>
          </Panel>
          <Panel icon={Mic} title={t("shopSettings.ktvCard")}>
            <div className="divide-y divide-border">
              <SwitchRow
                title={t("shopSettings.hasKtv")}
                hint={t("shopSettings.hasKtvHint")}
                checked={draft.ktvEnabled}
                onChange={(v) => set({ ktvEnabled: v })}
              />
              <SwitchRow
                title={t("shopSettings.ktvFood")}
                hint={t("shopSettings.ktvFoodHint")}
                checked={draft.ktvMenuOrdering}
                disabled={!draft.ktvEnabled}
                onChange={(v) => set({ ktvMenuOrdering: v })}
              />
            </div>
          </Panel>
        </div>
      </Section>

      <Section icon={Banknote} title={t("shopSettings.paymentsSection")}>
        <Panel title={t("shopSettings.whenPay")} className="space-y-3">
          <div role="radiogroup" aria-label={t("shopSettings.whenPay")} className="grid gap-3 sm:grid-cols-2">
            {TIMING.map((option) => (
              <Choice
                key={option.value}
                selected={draft.paymentTiming === option.value}
                onSelect={() => set({ paymentTiming: option.value })}
                title={t(option.title)}
                hint={t(option.hint)}
              />
            ))}
          </div>
        </Panel>
        <Panel title={t("shopSettings.currency")} className="space-y-3">
          <p className="text-xs text-muted">{t("shopSettings.currencyHint")}</p>
          <div role="radiogroup" aria-label={t("shopSettings.currency")} className="grid gap-3 sm:grid-cols-2">
            {CURRENCIES.map((option) => (
              <Choice
                key={option.value}
                selected={draft.currency === option.value}
                onSelect={() => set({ currency: option.value })}
                title={t(option.title)}
                hint={option.sample}
                mono
              />
            ))}
          </div>
        </Panel>
      </Section>

      <Section icon={Package} title={t("shopSettings.salesSection")}>
        <div className="grid gap-4 md:grid-cols-2">
          <Panel icon={Package} title={t("shopSettings.stockCard")}>
            <SwitchRow
              title={t("shopSettings.trackStock")}
              hint={t("shopSettings.trackStockHint")}
              checked={draft.trackStock}
              onChange={(v) => set({ trackStock: v })}
            />
          </Panel>
          <Panel icon={Receipt} title={t("shopSettings.taxCard")} className="space-y-2">
            <label htmlFor="default-tax-rate" className="text-sm font-medium">
              {t("shopSettings.defaultTax")}
            </label>
            <TaxRateSelect
              id="default-tax-rate"
              value={draft.defaultTaxRateId ?? ""}
              onChange={(v) => set({ defaultTaxRateId: v || null })}
              tenantId={saved.tenantId}
              noneLabel={t("shopSettings.noDefaultTax")}
            />
            <p className="text-xs text-muted">{t("shopSettings.defaultTaxHint")}</p>
          </Panel>
          <Panel icon={BadgePercent} title={t("shopSettings.promotions")} className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">{t("shopSettings.limitFor")}</p>
              <div
                role="radiogroup"
                aria-label={t("shopSettings.limitFor")}
                className="grid grid-cols-2 rounded-xl border border-border p-1"
              >
                {LIMIT_FOR.map((option) => {
                  const selected = perBill === (option.value === "BILL");
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() =>
                        set(
                          option.value === "ITEM"
                            ? { maxPromotionsPerItem: Math.min(limit, 3), maxPromotionsPerBill: null }
                            : { maxPromotionsPerItem: 1, maxPromotionsPerBill: limit },
                        )
                      }
                      className={cn(
                        "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        selected ? "bg-mint/20 text-foreground shadow-sm" : "text-muted hover:text-foreground",
                      )}
                    >
                      {t(option.title)}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm">{t("shopSettings.upTo")}</span>
              <Stepper
                label={t("shopSettings.howMany")}
                value={limit}
                min={1}
                max={perBill ? 5 : 3}
                onChange={(n) => set(perBill ? { maxPromotionsPerBill: n } : { maxPromotionsPerItem: n })}
              />
              <span className="text-sm">
                {t(perBill ? "shopSettings.promotionsPerBill" : "shopSettings.promotionsPerItem")}
              </span>
            </div>
            <p className="text-xs text-muted">
              {t(perBill ? "shopSettings.perBillHint" : "shopSettings.perItemHint")}
            </p>
          </Panel>
        </div>
      </Section>

      {changed.length > 0 ? (
        <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-mint/50 bg-background/95 px-5 py-3 shadow-lg backdrop-blur">
          <span className="text-sm font-medium">{t("shopSettings.unsaved").replace("{count}", String(changed.length))}</span>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setEdits({})} disabled={update.isPending}>
              {t("shopSettings.discard")}
            </Button>
            <Button type="button" onClick={save} disabled={update.isPending}>
              {update.isPending ? t("shopSettings.saving") : t("shopSettings.save")}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
