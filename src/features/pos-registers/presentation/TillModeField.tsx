"use client";

import type { RegisterMode } from "@/core/domain/entities/PosRegister";
import { Label } from "@/presentation/components/ui/label";
import { useLanguage } from "@/presentation/providers/LanguageProvider";

const MODES = [
  { value: "CASHIER", label: "shifts.cashier", hint: "shifts.cashierHint" },
  { value: "ROOM", label: "shifts.room", hint: "shifts.roomHint" },
] as const;

export function TillModeField({
  value,
  onChange,
}: {
  value: RegisterMode;
  onChange: (mode: RegisterMode) => void;
}) {
  const { t } = useLanguage();
  return (
    <div className="grid gap-2">
      <Label>{t("shifts.tillType")}</Label>
      <div role="radiogroup" className="grid gap-2 sm:grid-cols-2">
        {MODES.map((mode) => (
          <button
            key={mode.value}
            type="button"
            role="radio"
            aria-checked={value === mode.value}
            onClick={() => onChange(mode.value)}
            className={`rounded-lg border p-3 text-left transition-colors ${
              value === mode.value ? "border-mint bg-mint/10" : "border-border hover:bg-muted/30"
            }`}
          >
            <span className="block font-medium text-foreground">{t(mode.label)}</span>
            <span className="mt-1 block text-xs text-muted">{t(mode.hint)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
