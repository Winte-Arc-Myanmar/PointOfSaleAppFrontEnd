"use client";

import { InfoTip } from "@/presentation/components/ui/info-tip";
import type { PosKind, ShiftRule } from "@/core/domain/entities/PosRegister";
import { Label } from "@/presentation/components/ui/label";
import { useLanguage } from "@/presentation/providers/LanguageProvider";

const KINDS = [
  { value: "BAR", label: "shifts.restaurant" },
  { value: "KTV", label: "shifts.ktv" },
  { value: "SPA", label: "shifts.spa" },
] as const;

const RULES = [
  { value: "PER_LOGIN", label: "shifts.perLogin", hint: "shifts.perLoginHint" },
  { value: "DAILY", label: "shifts.daily", hint: "shifts.dailyHint" },
] as const;

const choice = (on: boolean) =>
  `rounded-lg border p-3 text-left transition-colors ${
    on ? "border-mint bg-mint/10" : "border-border hover:bg-muted/30"
  }`;

/** What a POS device sells, and how its shift runs. */
export function PosDeviceSetupFields({
  sellsAt,
  onSellsAtChange,
  shiftRule,
  onShiftRuleChange,
  error,
}: {
  sellsAt: PosKind[];
  onSellsAtChange: (kinds: PosKind[]) => void;
  shiftRule: ShiftRule;
  onShiftRuleChange: (rule: ShiftRule) => void;
  error?: string;
}) {
  const { t } = useLanguage();
  const toggle = (kind: PosKind) =>
    onSellsAtChange(sellsAt.includes(kind) ? sellsAt.filter((k) => k !== kind) : [...sellsAt, kind]);

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label>
          {t("shifts.sellsAt")}
          <InfoTip text={t("shifts.sellsAtHint")} />
        </Label>
        <div className="grid gap-2 sm:grid-cols-3">
          {KINDS.map((kind) => (
            <button
              key={kind.value}
              type="button"
              role="checkbox"
              aria-checked={sellsAt.includes(kind.value)}
              onClick={() => toggle(kind.value)}
              className={choice(sellsAt.includes(kind.value))}
            >
              <span className="font-medium text-foreground">{t(kind.label)}</span>
            </button>
          ))}
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </div>
      <div className="grid gap-2">
        <Label>{t("shifts.shift")}</Label>
        <div role="radiogroup" className="grid gap-2 sm:grid-cols-2">
          {RULES.map((rule) => (
            <button
              key={rule.value}
              type="button"
              role="radio"
              aria-checked={shiftRule === rule.value}
              onClick={() => onShiftRuleChange(rule.value)}
              className={choice(shiftRule === rule.value)}
            >
              <span className="block font-medium text-foreground">
                {t(rule.label)}
                <InfoTip text={t(rule.hint)} />
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
