"use client";

import { useState } from "react";
import { ReceiptText, Tag } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { AppLoader } from "@/presentation/components/loader";
import { useToast } from "@/presentation/providers/ToastProvider";
import { useLanguage } from "@/presentation/providers/LanguageProvider";
import { useUpdateVenueSettings, useVenueSettings } from "@/presentation/hooks/useVenueSettings";
import { apiErrorMessage } from "@/lib/api-error";
import { cn } from "@/lib/utils";
import type { RoomPaymentTiming, VenueSettingUpdate } from "@/core/domain/entities/VenueSetting";

type Draft = Required<VenueSettingUpdate>;

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
    <div className={cn("flex items-center justify-between gap-4 py-3", disabled && "opacity-50")}>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted">{hint}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors",
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
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-background/80 px-5 py-4 shadow-sm">
      <h2 className="text-base font-semibold">{title}</h2>
      <div className="divide-y divide-border">{children}</div>
    </section>
  );
}

const TIMING = [
  { value: "PAY_WHEN_ORDERING", title: "shopSettings.payEachTime", hint: "shopSettings.payEachTimeHint" },
  { value: "PAY_AT_END", title: "shopSettings.payWhenLeaving", hint: "shopSettings.payWhenLeavingHint" },
] as const satisfies readonly { value: RoomPaymentTiming; title: string; hint: string }[];

const LIMIT_FOR = [
  { value: "ITEM", title: "shopSettings.perItem", icon: Tag },
  { value: "BILL", title: "shopSettings.perBill", icon: ReceiptText },
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
    roomCardOnly: saved.roomCardOnly ?? true,
    maxPromotionsPerItem: saved.maxPromotionsPerItem ?? 1,
    maxPromotionsPerBill: saved.maxPromotionsPerBill ?? null,
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
    <div className="max-w-2xl space-y-5">
      <Card title={t("shopSettings.spaCard")}>
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
      </Card>

      <Card title={t("shopSettings.ktvCard")}>
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
      </Card>

      <section className="space-y-3 rounded-2xl border border-border bg-background/80 px-5 py-4 shadow-sm">
        <h2 className="text-base font-semibold">{t("shopSettings.whenPay")}</h2>
        <div role="radiogroup" className="grid gap-3 sm:grid-cols-2">
          {TIMING.map((option) => {
            const selected = draft.paymentTiming === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => set({ paymentTiming: option.value })}
                className={cn(
                  "rounded-xl border p-4 text-left transition-colors",
                  selected ? "border-mint bg-mint/15" : "border-border hover:border-mint/60",
                )}
              >
                <p className="text-sm font-semibold">{t(option.title)}</p>
                <p className="mt-1 text-xs text-muted">{t(option.hint)}</p>
              </button>
            );
          })}
        </div>
        {draft.paymentTiming === "PAY_AT_END" ? (
          <div className="divide-y divide-border">
            <SwitchRow
              title={t("shopSettings.cardOnly")}
              hint={draft.roomCardOnly ? t("shopSettings.cardOnlyOn") : t("shopSettings.cardOnlyOff")}
              checked={draft.roomCardOnly}
              onChange={(v) => set({ roomCardOnly: v })}
            />
          </div>
        ) : (
          <p className="text-xs text-muted">{t("shopSettings.eachTimeIsCard")}</p>
        )}
      </section>

      <section className="space-y-3 rounded-2xl border border-border bg-background/80 px-5 py-4 shadow-sm">
        <h2 className="text-base font-semibold">{t("shopSettings.promotions")}</h2>
        <p className="text-sm font-medium">{t("shopSettings.limitFor")}</p>
        <div role="radiogroup" aria-label={t("shopSettings.limitFor")} className="grid gap-3 sm:grid-cols-2">
          {LIMIT_FOR.map((option) => {
            const selected = (draft.maxPromotionsPerBill === null) === (option.value === "ITEM");
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() =>
                  set(
                    option.value === "ITEM"
                      ? { maxPromotionsPerItem: limit, maxPromotionsPerBill: null }
                      : { maxPromotionsPerItem: 1, maxPromotionsPerBill: limit },
                  )
                }
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-4 text-left transition-colors",
                  selected ? "border-mint bg-mint/15" : "border-border hover:border-mint/60",
                )}
              >
                <option.icon className={cn("size-6", selected ? "text-mint" : "text-muted")} />
                <span className="text-sm font-semibold">{t(option.title)}</span>
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm font-medium">{t("shopSettings.howMany")}</p>
          <div role="radiogroup" aria-label={t("shopSettings.howMany")} className="flex gap-1">
            {(perBill ? [1, 2, 3, 4, 5] : [1, 2, 3]).map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={limit === n}
                onClick={() => set(perBill ? { maxPromotionsPerBill: n } : { maxPromotionsPerItem: n })}
                className={cn(
                  "size-10 rounded-lg border text-sm font-medium",
                  limit === n ? "border-mint bg-mint/15" : "border-border hover:border-mint/60",
                )}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted">{t(perBill ? "shopSettings.perBillHint" : "shopSettings.perItemHint")}</p>
      </section>

      <div className="flex items-center gap-3">
        <Button type="button" onClick={save} disabled={changed.length === 0 || update.isPending}>
          {update.isPending ? t("shopSettings.saving") : t("shopSettings.save")}
        </Button>
        {changed.length === 0 ? <span className="text-xs text-muted">{t("shopSettings.noChanges")}</span> : null}
      </div>
    </div>
  );
}
