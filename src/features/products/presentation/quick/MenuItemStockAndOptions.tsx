"use client";

import { useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { InfoTip } from "@/presentation/components/ui/info-tip";
import { useProductVariants } from "@/presentation/hooks/useProductVariants";
import { getPaginatedItems } from "@/presentation/hooks/pagination";
import type { Product } from "@/core/domain/entities/Product";
import type { ModifierGroup } from "@/core/domain/entities/ModifierGroup";

export interface IngredientRow {
  key: string;
  /** The ingredient's name, for a row loaded from the saved recipe. */
  name?: string;
  productId: string;
  variantId: string;
  quantity: string;
  uomId: string;
}

type Unit = { id: string | number; name: string; abbreviation?: string | null };

export const newIngredientRow = (): IngredientRow => ({
  key: Math.random().toString(36).slice(2),
  productId: "",
  variantId: "",
  quantity: "",
  uomId: "",
});

/** One ingredient: which stock item, how much one serving uses, in what unit. */
function IngredientLine({
  row,
  products,
  units,
  currentName,
  onChange,
  onRemove,
}: {
  row: IngredientRow;
  products: Product[];
  units: Unit[];
  currentName?: string;
  onChange: (row: IngredientRow) => void;
  onRemove: () => void;
}) {
  const { data } = useProductVariants(row.productId || null, { page: 1, limit: 50 });
  const firstVariant = getPaginatedItems(data)[0];

  useEffect(() => {
    if (row.productId && firstVariant && !row.variantId) {
      onChange({ ...row, variantId: String(firstVariant.id) });
    }
  }, [firstVariant, onChange, row]);

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_6rem_8rem_auto] items-center gap-2">
      <Select
        value={row.productId || undefined}
        onValueChange={(productId) => {
          const product = products.find((p) => String(p.id) === productId);
          onChange({
            ...row,
            productId: String(productId),
            variantId: "",
            uomId: row.uomId || product?.baseUomId || "",
          });
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder={currentName ?? "Choose an ingredient"} />
        </SelectTrigger>
        <SelectContent>
          {products.map((p) => (
            <SelectItem key={String(p.id)} value={String(p.id)}>
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        type="number"
        min={0}
        step="any"
        inputMode="decimal"
        aria-label="Amount per serving"
        placeholder="e.g. 50"
        value={row.quantity}
        onChange={(e) => onChange({ ...row, quantity: e.target.value })}
      />
      <Select value={row.uomId || undefined} onValueChange={(uomId) => onChange({ ...row, uomId: String(uomId) })}>
        <SelectTrigger aria-label="Unit">
          <SelectValue placeholder="Unit" />
        </SelectTrigger>
        <SelectContent>
          {units.map((u) => (
            <SelectItem key={String(u.id)} value={String(u.id)}>
              {u.abbreviation || u.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button type="button" variant="ghost" size="icon" aria-label="Remove ingredient" onClick={onRemove}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function MenuItemOptions({
  groups,
  value,
  onChange,
}: {
  groups: ModifierGroup[];
  value: string[];
  onChange: (ids: string[]) => void;
}) {
  return (
    <section className="space-y-2">
      <h2 className="text-sm font-semibold">
        Options
        <InfoTip text="Add-ons and choices the guest picks with this item, like size or extra cheese." />
      </h2>
      {groups.length ? (
        <div className="flex flex-wrap gap-2">
          {groups.map((group) => {
            const id = String(group.id);
            const on = value.includes(id);
            return (
              <label
                key={id}
                className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-sm ${
                  on ? "border-mint bg-mint/10" : "border-border"
                }`}
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-emerald-500"
                  checked={on}
                  onChange={() => onChange(on ? value.filter((v) => v !== id) : [...value, id])}
                />
                {group.name}
                {group.isRequired ? <span className="text-xs text-muted">(required)</span> : null}
              </label>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-muted">
          No add-on groups yet. Create them under Menu → Modifier groups.
        </p>
      )}
    </section>
  );
}

export function MenuItemStock({
  enabled,
  stockControlOn,
  onEnabledChange,
  rows,
  onRowsChange,
  products,
  units,
}: {
  enabled: boolean;
  stockControlOn: boolean;
  onEnabledChange: (on: boolean) => void;
  rows: IngredientRow[];
  onRowsChange: (rows: IngredientRow[]) => void;
  products: Product[];
  units: Unit[];
}) {
  const update = (key: string) => (row: IngredientRow) =>
    onRowsChange(rows.map((r) => (r.key === key ? row : r)));
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">
          Stock
          <InfoTip text="On: each sale uses up these ingredients. Off: the item itself is counted." />
        </h2>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="h-4 w-4 accent-emerald-500"
            checked={enabled}
            onChange={(e) => {
              onEnabledChange(e.target.checked);
              if (e.target.checked && !rows.length) onRowsChange([newIngredientRow()]);
            }}
          />
          Track by ingredients
        </label>
      </div>
      {!stockControlOn ? (
        <p className="text-xs text-amber-600">
          Stock control is off in Shop settings, so sales won&apos;t use up stock yet.
        </p>
      ) : null}
      {enabled ? (
        <div className="space-y-2">
          {rows.map((row) => (
            <IngredientLine
              key={row.key}
              row={row}
              products={products}
              units={units}
              currentName={row.name}
              onChange={update(row.key)}
              onRemove={() => onRowsChange(rows.filter((r) => r.key !== row.key))}
            />
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => onRowsChange([...rows, newIngredientRow()])}>
            <Plus className="mr-1 h-4 w-4" /> Add ingredient
          </Button>
        </div>
      ) : null}
    </section>
  );
}
