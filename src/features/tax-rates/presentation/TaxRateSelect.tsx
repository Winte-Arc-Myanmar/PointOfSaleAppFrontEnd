"use client";

import { useTaxRates } from "@/presentation/hooks/useTaxRates";
import { getPaginatedItems } from "@/presentation/hooks/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { taxPercent } from "@/lib/tax-percent";

const NONE = "__none__";

export function TaxRateSelect({
  id,
  value,
  onChange,
  tenantId,
  noneLabel = "No tax rate",
  disabled,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  tenantId?: string;
  noneLabel?: string;
  disabled?: boolean;
}) {
  const { data } = useTaxRates({ page: 1, limit: 100 });
  const rates = getPaginatedItems(data).filter(
    (rate) => !rate.deletedAt && (!tenantId || String(rate.tenantId) === tenantId)
  );
  return (
    <Select
      value={value || NONE}
      onValueChange={(next) => onChange(!next || next === NONE ? "" : String(next))}
      disabled={disabled}
    >
      <SelectTrigger id={id}>
        <SelectValue placeholder={noneLabel} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE}>{noneLabel}</SelectItem>
        {rates.map((rate) => (
          <SelectItem key={String(rate.id)} value={String(rate.id)}>
            {rate.name} ({taxPercent(rate.ratePercentage)}%{rate.isPriceInclusive ? ", included" : ""})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
