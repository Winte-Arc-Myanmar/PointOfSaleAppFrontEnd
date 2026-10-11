"use client";

import { useTaxRates } from "@/presentation/hooks/useTaxRates";
import { getPaginatedItems } from "@/presentation/hooks/pagination";
import { taxPercent } from "@/lib/tax-percent";
import { cn } from "@/lib/utils";

export function TaxRateMultiSelect({
  id,
  value,
  onChange,
  tenantId,
  emptyLabel = "No tax rates yet. Add one under Tax rates.",
  disabled,
}: {
  id?: string;
  value: string[];
  onChange: (value: string[]) => void;
  tenantId?: string;
  emptyLabel?: string;
  disabled?: boolean;
}) {
  const { data } = useTaxRates({ page: 1, limit: 100 });
  const rates = getPaginatedItems(data).filter(
    (rate) => !rate.deletedAt && (!tenantId || String(rate.tenantId) === tenantId)
  );
  const chosen = rates.filter((rate) => value.includes(String(rate.id)));
  // One item's taxes are all inside the price or all on top, never both.
  const inclusive = chosen.length ? chosen[0].isPriceInclusive : null;

  if (!rates.length) return <p className="text-sm text-muted">{emptyLabel}</p>;

  return (
    <div id={id} role="group" className="divide-y divide-border rounded-lg border border-border">
      {rates.map((rate) => {
        const rateId = String(rate.id);
        const checked = value.includes(rateId);
        const blocked = !checked && inclusive !== null && rate.isPriceInclusive !== inclusive;
        return (
          <label
            key={rateId}
            className={cn(
              "flex items-center gap-3 px-3 py-2 text-sm",
              blocked || disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
            )}
            title={blocked ? "Taxes on one item must all be included in the price, or all added on top" : undefined}
          >
            <input
              type="checkbox"
              className="h-4 w-4 accent-emerald-500"
              checked={checked}
              disabled={blocked || disabled}
              onChange={(e) =>
                onChange(e.target.checked ? [...value, rateId] : value.filter((v) => v !== rateId))
              }
            />
            <span className="flex-1">
              {rate.name} ({taxPercent(rate.ratePercentage)}%)
            </span>
            <span className="text-xs text-muted">
              {[rate.isPriceInclusive ? "included" : null, rate.appliesToServiceCharge ? "on service" : null]
                .filter(Boolean)
                .join(" · ")}
            </span>
          </label>
        );
      })}
    </div>
  );
}
